const {
  sortByDepartureTime,
  isValidItinerary,
  itinerarySummary,
  createEarliestItinerary,
  createStupidItineraryForRoute,
  RoutingError,
  RouteDatabase,
} = require("../script/routing.js");
const { Database } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");
const { DateTime } = require("luxon");

test("sortByDepartureTime", function () {
  const c1 = createConnection([
    ["2024-10-15", "16:00", "city1MainStationId"],
    ["2024-10-15", "17:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-13", "18:00", "city1MainStationId"],
    ["2024-10-13", "19:00", "city2MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "07:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
  ]);

  const connections = [c1, c2, c3];
  sortByDepartureTime(connections);

  expect(connections).toStrictEqual([c2, c3, c1]);
});
test("isValidItineraryOneLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const itinerary = [c1];
  expect(isValidItinerary(itinerary)).toBe(true);
});

test("isValidItineraryTwoLegs", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const itinerary = [c1, c2];
  expect(isValidItinerary(itinerary)).toBe(true);
});

test("isValidItineraryTwoLegsSecondLeavesTooEarlySameDay", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "06:50", "city2MainStationId"],
    ["2024-10-15", "07:00", "city3MainStationId"],
  ]);

  const itinerary = [c1, c2];
  expect(isValidItinerary(itinerary)).toBe(false);
});

test("isValidItineraryTwoLegsSecondLeavesTooEarlyDayBefore", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-14", "08:50", "city2MainStationId"],
    ["2024-10-14", "09:00", "city3MainStationId"],
  ]);

  const itinerary = [c1, c2];
  expect(isValidItinerary(itinerary)).toBe(false);
});

test("itinerarySummaryOneTravelDay", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);

  const itinerary = [c1, c2];

  const got = itinerarySummary(itinerary);
  const exp = {
    travelDays: 1,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 7 * 60 + 10,
    longestDailyTravelTime: 69,
    busiestDay: 0,
    totalTravelTime: 69,
  };

  expect(got).toStrictEqual(exp);
});

test("itinerarySummaryMultipleTravelDays", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "06:01", "city2MainStationId"],
    ["2024-10-16", "06:10", "city1MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-16", "09:01", "city1MainStationId"],
    ["2024-10-16", "09:10", "city3MainStationId"],
  ]);
  const c4 = createConnection([
    ["2024-10-17", "06:01", "city3MainStationId"],
    ["2024-10-17", "06:10", "city4MainStationId"],
  ]);

  const itinerary = [c1, c2, c3, c4];

  const got = itinerarySummary(itinerary);
  const exp = {
    travelDays: 3,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 9 * 60 + 10,
    longestDailyTravelTime: 3 * 60 + 9,
    totalTravelTime: 9 + 3 * 60 + 9 + 9,
    busiestDay: 1,
  };

  expect(got).toStrictEqual(exp);
});

test("itinerarySummaryMultipleTravelDaysWithGap", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "06:01", "city2MainStationId"],
    ["2024-10-17", "06:10", "city3MainStationId"],
  ]);

  const itinerary = [c1, c2];

  const got = itinerarySummary(itinerary);
  const exp = {
    travelDays: 3,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 6 * 60 + 10,
    longestDailyTravelTime: 9,
    totalTravelTime: 9 + 9,
    busiestDay: 0,
  };

  expect(got).toStrictEqual(exp);
});

test("getEarliestItineraryOnlyOneConnection", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const got = createEarliestItinerary(c1, []);
  const exp = [c1];

  expect(got).toStrictEqual(exp);
});

test("getEarliestItineraryMultipleConnectionsSecondNotReachable", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "09:01", "city2MainStationId"],
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);

  const call = () => createEarliestItinerary(c1, [[c2]]);
  expect(call).toThrow(RoutingError);
});

test("getEarliestItineraryMultipleConnections", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "12:00", "city3MainStationId"],
    ["2024-10-15", "13:00", "city4MainStationId"],
  ]);

  const got = createEarliestItinerary(c1, [[c2], [c3]]);
  const exp = [c1, c2, c3];

  expect(got).toStrictEqual(exp);
});

test("getEarliestItineraryMultipleConnectionsALternativesAvailable", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);
  const c2_a = createConnection([
    ["2024-10-15", "09:01", "city2MainStationId"], // not reachable
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);
  const c2_b = createConnection([
    ["2024-10-15", "10:00", "city2MainStationId"], // reachable
    ["2024-10-15", "11:00", "city3MainStationId"],
  ]);
  const c3_a = createConnection([
    ["2024-10-15", "12:00", "city3MainStationId"], // reachable
    ["2024-10-15", "13:00", "city4MainStationId"],
  ]);
  const c3_b = createConnection([
    ["2024-10-15", "13:00", "city3MainStationId"], // reachable but irrelevant
    ["2024-10-15", "14:00", "city4MainStationId"],
  ]);

  const got = createEarliestItinerary(c1, [
    [c2_a, c2_b],
    [c3_a, c3_b],
  ]);
  const exp = [c1, c2_b, c3_a];

  expect(got).toStrictEqual(exp);
});

test("createStupidItinerary", function () {
  const c1_a = createConnection([
    ["2024-10-15", "04:00", "city1MainStationId"], // very early
    ["2024-10-15", "05:00", "city2MainStationId"],
  ]);
  const c1_b = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"], // nicer time, will get more points
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);
  const c2_a = createConnection([
    ["2024-10-15", "04:01", "city2MainStationId"], // not reachable for c1_a
    ["2024-10-15", "05:00", "city3MainStationId"],
  ]);
  const c2_b = createConnection([
    ["2024-10-15", "10:00", "city2MainStationId"], // reachable for c1_a and c1_b
    ["2024-10-15", "11:00", "city3MainStationId"],
  ]);
  const c3_a = createConnection([
    ["2024-10-15", "12:00", "city3MainStationId"], // reachable
    ["2024-10-15", "13:00", "city4MainStationId"],
  ]);
  const c3_b = createConnection([
    ["2024-10-15", "13:00", "city3MainStationId"], // reachable but irrelevant
    ["2024-10-15", "14:00", "city4MainStationId"],
  ]);

  const database = new Database([c1_a, c1_b, c2_a, c2_b, c3_a, c3_b]);
  const got = createStupidItineraryForRoute(
    [
      { startCityName: "City1", endCityName: "City2" },
      { startCityName: "City2", endCityName: "City3" },
      { startCityName: "City3", endCityName: "City4" },
    ],
    DateTime.fromISO("2024-10-15"),
    database,
  );

  const exp = [c1_b.uniqueId, c2_b.uniqueId, c3_a.uniqueId];
  expect(got).toStrictEqual(exp);
});

test("routeDatabase", function () {
  const c1 = createConnection([
    ["2024-10-15", "04:00", "city1MainStationId"],
    ["2024-10-15", "05:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "09:01", "city2MainStationId"],
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "09:01", "city1MainStationId"],
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);

  const routes = {
    "City1->City2": ["//some comment", ["City1->City2"]],
    "City1->City3": [["City1->City2", "City2->City3"], ["City1->City3"]],
  };
  const routesDatabase = new RouteDatabase(routes);

  expect(routesDatabase.hasRoutes("City1", "City2")).toBe(true);
  expect(routesDatabase.hasRoutes("City2", "City3")).toBe(false);

  const got = routesDatabase.getItineraries(
    "City1",
    "City3",
    DateTime.fromISO("2024-10-15"),
    database,
  );

  // two itineraries, the one with the fewer transfers should be first
  const exp = [[c3.uniqueId], [c1.uniqueId, c2.uniqueId]];
  expect(got).toStrictEqual(exp);
});
