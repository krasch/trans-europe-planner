const { isValidItinerary, itinerarySummary } = require("../script/routing.js");
const { Database } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

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

  const actual = itinerarySummary(itinerary);
  const expected = {
    travelDays: 1,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 7 * 60 + 10,
    longestDailyTravelTime: 69,
    busiestDay: 0,
    totalTravelTime: 69,
  };

  expect(actual).toStrictEqual(expected);
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

  const actual = itinerarySummary(itinerary);
  const expected = {
    travelDays: 3,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 9 * 60 + 10,
    longestDailyTravelTime: 3 * 60 + 9,
    totalTravelTime: 9 + 3 * 60 + 9 + 9,
    busiestDay: 1,
  };

  expect(actual).toStrictEqual(expected);
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

  const actual = itinerarySummary(itinerary);
  const expected = {
    travelDays: 3,
    earliestDeparture: 6 * 60 + 1,
    latestDeparture: 6 * 60 + 1,
    latestArrival: 6 * 60 + 10,
    longestDailyTravelTime: 9,
    totalTravelTime: 9 + 9,
    busiestDay: 0,
  };

  expect(actual).toStrictEqual(expected);
});
