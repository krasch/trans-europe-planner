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
  // todo only checks for timings, does not check that there are no legs missing
  let valid = true;

  for (let i in itinerary) {
    if (i === "0") continue;

    const arrival = itinerary[i - 1].stops.at(-1).arrival;
    const departure = itinerary[i].stops.at(0).departure;
    const changeTime = departure.minutesSince(arrival);

    valid = valid && changeTime > 30;
  }

  return valid;
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
  return (
    // highest priority: reduce number of days in itinerary
    summary.travelDays * -1000 +
    // don't depart before 8
    (summary.earliestDeparture >= 8 * 60) * 200 +
    // don't arrive after 10
    (summary.latestArrival <= 22 * 60) * 100 +
    // don't depart after 10
    (summary.latestDeparture <= 10 * 60) * 50 +
    // most travel should be done on first day
    (summary.busiestDay === 0) * 50 +
    // don't travel more than 9 hours per day
    (summary.longestDailyTravelTime <= 9 * 60) * 10
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

function createJourneyForRoute(legs, database) {
  const connections = createItineraryForRoute(legs, database);

  const connectionsByLeg = {};
  for (let i in legs) {
    connectionsByLeg[legs[i]] = connections[i];
  }

  return new Journey(connectionsByLeg);
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cartesianProduct = cartesianProduct;
  module.exports.isValidItinerary = isValidItinerary;
  module.exports.itinerarySummary = itinerarySummary;
  module.exports.chooseItinerary = chooseItinerary;
  module.exports.createItineraryForRoute = createItineraryForRoute;
  module.exports.CreatingItineraryNotPossible = CreatingItineraryNotPossible;
}
