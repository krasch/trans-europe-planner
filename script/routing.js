const TRANSFER_TIME = 30; // minutes

class RoutingError extends Error {
  constructor(message) {
    super(message);
    this.name = "RoutingError";
  }
}

function diffDays(earlierDateTime, laterDateTime) {
  const earlierDate = earlierDateTime.startOf("day");
  const laterDate = laterDateTime.startOf("day");
  return laterDate.diff(earlierDate, "days").as("days");
}

function minutesSinceMidnight(datetime) {
  const midnight = datetime.startOf("day");
  return datetime.diff(midnight).as("minutes");
}

function sortByDepartureTime(connections) {
  connections.sort(
    (c1, c2) => c1.departure.toMillis() - c2.departure.toMillis(),
  );
}

function isValidItinerary(itinerary) {
  for (let i in itinerary) {
    if (i === "0") continue;

    if (itinerary[i - 1].transferTime(itinerary[i]) < TRANSFER_TIME)
      return false;
  }

  return true;
}

function itinerarySummary(itinerary) {
  // assumes you are passing in a valid itinerary

  const itineraryDeparture = itinerary[0].departure;
  const itineraryArrival = itinerary.at(-1).arrival;

  const totalTravelDays = diffDays(itineraryDeparture, itineraryArrival) + 1;

  // initialise an array with one entry per travel day
  // each entry is initialised as an empty array
  const connectionsByTravelDay = Array.from(
    { length: totalTravelDays },
    () => [],
  );

  // group connections by travel day (offset from departure)
  // this keeps current order within the connections for a travel day
  for (let connection of itinerary) {
    const day = diffDays(itineraryDeparture, connection.departure);
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
  connectionsByTravelDay.forEach((connectionsForDay, i) => {
    // no connections on this day
    if (connectionsForDay.length === 0) return;

    const departure = connectionsForDay[0].departure;
    const arrival = connectionsForDay.at(-1).arrival;

    const travelTime = arrival.diff(departure).as("minutes");
    const departureMinutes = minutesSinceMidnight(departure);
    const arrivalMinutes = minutesSinceMidnight(arrival);

    if (departureMinutes < summary.earliestDeparture)
      summary.earliestDeparture = departureMinutes;

    if (departureMinutes > summary.latestDeparture)
      summary.latestDeparture = departureMinutes;

    if (arrivalMinutes > summary.latestArrival)
      summary.latestArrival = arrivalMinutes;

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

function createEarliestItinerary(
  connectionForFirstLeg,
  connectionsByLegForOtherLegs,
) {
  // connectionForFirstLeg = create itinerary that starts with this connection
  // connectionsPerLegForOtherLegs = [[conns_for_leg_2], [conns_for_leg_3], ...]
  // where each conns for conns_for_leg is sorted by departure time

  const itinerary = [connectionForFirstLeg];

  // loop over legs
  for (let connectionsForLeg of connectionsByLegForOtherLegs) {
    const previousArrival = itinerary.at(-1).arrival;
    const relevantConnections = connectionsForLeg.filter(
      (c) => c.departure.diff(previousArrival).as("minutes") >= TRANSFER_TIME,
    );

    if (relevantConnections.length === 0) throw new RoutingError();

    itinerary.push(relevantConnections[0]); // earliest we can catch for this leg
  }

  return itinerary;
}

// todo max length?
//const routeCache = new Map();

function createStupidItineraryForRoute(legs, date, database) {
  if (legs.length === 0) return [];

  //const cacheKey = legs.map((l) => l.toString()).join(";");
  //if (routeCache.has(cacheKey)) return routeCache.get(cacheKey);

  // want connections on travel day + 2 extra days
  const dates = [];
  for (let day of [0, 1, 2]) dates.push(date.plus({ days: day }));

  // look up all necessary data from database and sort by departure time
  const connectionsByLeg = legs.map((l) => {
    const connections = database.connectionsForLeg(
      l.startCityName,
      l.endCityName,
      dates,
    );
    sortByDepartureTime(connections);
    return connections;
  });

  const connectionsFirstLeg = connectionsByLeg[0];
  if (connectionsFirstLeg.length === 0) throw new RoutingError();

  const connectionsByLegForOtherLegs = connectionsByLeg.slice(
    1,
    connectionsByLeg.length,
  );

  let itinerary = null;
  let points = -1000000;

  for (let i in connectionsFirstLeg) {
    const candidate = createEarliestItinerary(
      connectionsFirstLeg[i],
      connectionsByLegForOtherLegs,
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

  const connectionIds = itinerary.map((c) => c.uniqueId);
  //routeCache.set(cacheKey, connectionIds);

  return connectionIds;
}

class RouteDatabase {
  #routes = {};

  #cachedItineraries = {};

  constructor(routes) {
    for (let key in routes) {
      // filter out comments
      const filtered = routes[key].filter((r) => typeof r !== "string");

      const parsed = filtered.map((route) =>
        route.map((leg) => this.#parseLeg(leg)),
      );

      // sort so that route with mininum transfers first
      parsed.sort((route1, route2) => route1.length - route2.length);

      this.#routes[key] = parsed;
    }
  }

  hasRoutes(startCityName, endCityName) {
    return this.#routes[this.#key(startCityName, endCityName)] !== undefined;
  }

  getRoutes(startCityName, endCityName) {
    if (!this.hasRoutes(startCityName, endCityName)) return [];
    return this.#routes[this.#key(startCityName, endCityName)];
  }

  getItineraries(startCityName, endCityName, date, database) {
    const cacheKey = this.#cacheKey(startCityName, endCityName, date);
    if (this.#cachedItineraries[cacheKey])
      return this.#cachedItineraries[cacheKey];

    const key = `${startCityName}->${endCityName}`;
    const routes = this.#routes[key];
    if (!routes)
      throw new RoutingError(
        `No route available for ${startCityName}->${endCityName}`,
      );

    const itineraries = [];
    for (let legs of routes) {
      try {
        itineraries.push(createStupidItineraryForRoute(legs, date, database));
      } catch (error) {
        // does not work on that day
        // if (error instanceof RoutingError) continue; // todo for now better to bubble up, all connections exist anyway on all dates
        throw error;
      }
    }

    if (itineraries.length === 0)
      throw new RoutingError(`No itineraries possible for ${key} on ${date}`);

    this.#cachedItineraries[cacheKey] = itineraries;
    return itineraries;
  }

  #key(startCityName, endCityName) {
    return `${startCityName}->${endCityName}`;
  }

  #cacheKey(startCityName, endCityName, date) {
    return `${this.#key(startCityName, endCityName)}XX${date.toISODate()}`;
  }

  #parseLeg(leg) {
    const [start, end] = leg.split("->");
    return { startCityName: start, endCityName: end };
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.sortByDepartureTime = sortByDepartureTime;
  module.exports.isValidItinerary = isValidItinerary;
  module.exports.itinerarySummary = itinerarySummary;
  module.exports.createEarliestItinerary = createEarliestItinerary;
  module.exports.createStupidItineraryForRoute = createStupidItineraryForRoute;
  module.exports.RoutingError = RoutingError;
  module.exports.RouteDatabase = RouteDatabase;
}
