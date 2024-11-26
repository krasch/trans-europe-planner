class CreatingItineraryNotPossible extends Error {
  constructor(message) {
    super(message);
    this.name = "CreatingItineraryNotPossible";
  }
}

function cartesianProduct(a) {
  if (a.length === 1) return a;

  // https://stackoverflow.com/a/43053803
  return a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
}

function isValidItinerary(itinerary) {
  for (let i in itinerary) {
    if (i === "0") continue;

    const arrival = itinerary[i - 1].stops.at(-1).arrival;
    const departure = itinerary[i].stops.at(0).departure;
    const changeTime = departure.minutesSince(arrival);

    if (changeTime < 30) return false;
  }

  return true;
}

function itinerarySummary(itinerary) {
  // assumes you are passing in a valid itinerary

  const departure = itinerary[0].stops[0].departure;
  const arrival = itinerary.at(-1).stops.at(-1).arrival;
  const totalTravelDays = arrival.daysSince(departure.dateString) + 1;

  // initialise an array with one entry per travel day
  // each entry is initialised as an empty array
  const connectionsByTravelDay = Array.from(
    { length: totalTravelDays },
    () => [],
  );

  // group connections by travel day (offset from departure)
  // this keeps current order within the connections for a travel day
  for (let connection of itinerary) {
    const day = connection.stops[0].departure.daysSince(departure.dateString);
    connectionsByTravelDay[day].push(connection);
  }

  const summary = {
    travelDays: totalTravelDays,
    earliestDeparture: 100000000,
    latestDeparture: 0,
    latestArrival: 0,
    longestDailyTravelTime: 0,
    totalTravelTime: 0,
    busiestDay: 0,
  };

  // calculate summary by going over each travel day
  connectionsByTravelDay.forEach((connections, i) => {
    // no connections on this day
    if (connections.length === 0) return;

    const departure = connections[0].stops[0].departure;
    const arrival = connections.at(-1).stops.at(-1).arrival;

    const travelTime =
      arrival.minutesSinceMidnight - departure.minutesSinceMidnight;

    if (departure.minutesSinceMidnight < summary.earliestDeparture)
      summary.earliestDeparture = departure.minutesSinceMidnight;

    if (departure.minutesSinceMidnight > summary.latestDeparture)
      summary.latestDeparture = departure.minutesSinceMidnight;

    if (arrival.minutesSinceMidnight > summary.latestArrival)
      summary.latestArrival = arrival.minutesSinceMidnight;

    if (travelTime > summary.longestDailyTravelTime) {
      summary.longestDailyTravelTime = travelTime;
      summary.busiestDay = i;
    }

    summary.totalTravelTime += travelTime;
  });

  return summary;
}

function judgeItinerary(summary) {
  const minutesBefore8 = Math.min(0, summary.earliestDeparture - 8 * 60);
  const minutesAfter22 = Math.min(0, 22 * 60 - summary.latestArrival);

  return (
    // highest priority: reduce number of days in itinerary
    summary.travelDays * -1000 +
    // don't depart before 8
    minutesBefore8 +
    // don't arrive after 22
    minutesAfter22
  );
}

function chooseItinerary(summaries) {
  // give points for number of travel days and some other rules
  const points = summaries.map(judgeItinerary);
  const maxPoints = Math.max(...points);

  // keep only itineraries with most points
  const indices = summaries.map((s, i) => i);
  const best = indices.filter((i) => points[i] === maxPoints);

  // tie-breaker is total travel time
  const travelTimes = best.map((i) => summaries[i].totalTravelTime);
  const minTravelTime = Math.min(...travelTimes);

  // get all that have roughly optimal travel time
  const threshold = minTravelTime;
  const bestAndShortest = best.filter(
    (i) => summaries[i].totalTravelTime <= threshold,
  );

  // of those take the first
  return bestAndShortest[0];
}

function createItineraryForRoute(legs, database) {
  if (legs.length === 0) return [];

  // look up all necessary data from database
  const connections = legs.map((l) =>
    Object.values(database.connectionsForLeg(l)),
  );

  // all possible combinations
  const allItineraries = cartesianProduct(connections);

  // keep only those that are actually valid, i.e. the timings of the connections work out
  const itineraries = allItineraries.filter((i) => isValidItinerary(i));

  // there is no combination of connections that work out
  if (itineraries.length === 0) throw new CreatingItineraryNotPossible();

  // calculate a bunch of stats about each itinerary (e.g. #travel days)
  const summaries = itineraries.map(itinerarySummary);

  // return the best one
  const bestIndex = chooseItinerary(summaries);
  const best = itineraries[bestIndex];

  // only need connection ids
  return best.map((connections) => connections.id);
}

function createEarliestItinerary(firstConnection, connectionsForOtherLegs) {
  const itinerary = [firstConnection];

  for (let i in connectionsForOtherLegs) {
    const previousArrival = itinerary.at(-1)["stops"].at(-1)["arrival"];
    const relevantConnections = connectionsForOtherLegs[i].filter(
      (c) => c.stops[0].departure.minutesSince(previousArrival) > 30,
    );
    itinerary.push(relevantConnections[0]);
  }

  return itinerary;
}

// todo max length?
const routeCache = new Map();

function createStupidItineraryForRoute(legs, database) {
  if (legs.length === 0) return [];

  const cacheKey = legs.map((l) => l.toString()).join(";");
  if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  // look up all necessary data from database and sort by departure time
  const connections = legs.map((l) => {
    const connsForLeg = Object.values(database.connectionsForLeg(l));
    connsForLeg.sort((a, b) =>
      a.stops[0].departure.compareTo(b.stops[0].departure),
    );
    return connsForLeg;
  });

  const connectionsForFirstLeg = connections[0];
  const connectionsForOtherLegs = connections.slice(1, connections.length);

  let itinerary = null;
  let points = -1000000;

  for (let i in connectionsForFirstLeg) {
    const candidate = createEarliestItinerary(
      connectionsForFirstLeg[i],
      connectionsForOtherLegs,
    );
    const pointsCandidate = judgeItinerary(itinerarySummary(candidate));

    // first time in loop
    if (itinerary == null) {
      itinerary = candidate;
      points = pointsCandidate;
      continue;
    }

    if (pointsCandidate > points) {
      itinerary = candidate;
      points = pointsCandidate;
    } else {
      break;
    }
  }

  const connectionIds = itinerary.map((c) => c.id);
  routeCache.set(cacheKey, connectionIds);

  return connectionIds;
}

function pickFittingConnection(connectionIds, desiredLeg, database) {
  const connections = connectionIds.map((i) => database.connection(i));
  connections.sort((a, b) =>
    a.stops.at(-1).arrival.compareTo(b.stops.at(-1).arrival),
  );

  const currentArrival = connections.at(-1).stops.at(-1).arrival;

  const candidates = database.connectionsForLeg(desiredLeg);

  const later = candidates.filter(
    (c) => c.stops[0].departure.minutesSince(currentArrival) > 0,
  );

  if (later.length > 0) return later[0].id;
  else return candidates[0].id; // fallback: pick earliest
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cartesianProduct = cartesianProduct;
  module.exports.isValidItinerary = isValidItinerary;
  module.exports.itinerarySummary = itinerarySummary;
  module.exports.chooseItinerary = chooseItinerary;
  module.exports.pickFittingConnection = pickFittingConnection;
  module.exports.createItineraryForRoute = createItineraryForRoute;
  module.exports.createStupidItineraryForRoute = createStupidItineraryForRoute;
}
