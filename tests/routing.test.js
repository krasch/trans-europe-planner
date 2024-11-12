const {
  cartesianProduct,
  isValidItinerary,
  itinerarySummary,
  chooseItinerary,
  pickFittingConnection,
} = require("../script/routing.js");
const { Database } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

test("cartesianProductSingleArraySingleItem", function () {
  const array1 = ["a"];
  const expected = [["a"]];

  expect(cartesianProduct([array1])).toStrictEqual(expected);
});

test("cartesianProductTwoArraysSingleItem", function () {
  const array1 = ["a"];
  const array2 = ["b"];
  const expected = [["a", "b"]];

  expect(cartesianProduct([array1, array2])).toStrictEqual(expected);
});

test("cartesianProductMultipleArraysMultipleItems", function () {
  const array1 = ["a", "b", "c"];
  const array2 = ["x"];
  const array3 = ["1", "2"];

  const expected = [
    ["a", "x", "1"],
    ["a", "x", "2"],
    ["b", "x", "1"],
    ["b", "x", "2"],
    ["c", "x", "1"],
    ["c", "x", "2"],
  ];

  expect(cartesianProduct([array1, array2, array3])).toStrictEqual(expected);
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

test("chooseItinerarySingleItinerary", function () {
  const it0 = {
    travelDays: 2,
    earliestDeparture: 8 * 60,
    latestArrival: 22 * 60,
    longestDailyTravelTime: 10 * 60,
    totalTravelTime: 20 * 60,
  };

  const actual = chooseItinerary([it0]);
  expect(actual).toStrictEqual(0);
});

test("chooseItineraryOneDayVersusTwoDays", function () {
  const it0 = {
    travelDays: 2,
    earliestDeparture: 8 * 60,
    latestArrival: 22 * 60,
    longestDailyTravelTime: 10 * 60,
    totalTravelTime: 20 * 60,
  };

  const it1 = {
    travelDays: 1,
    earliestDeparture: 8 * 60,
    latestArrival: 22 * 60,
    longestDailyTravelTime: 10 * 60,
    totalTravelTime: 10 * 60,
  };

  const actual = chooseItinerary([it0, it1]);
  expect(actual).toStrictEqual(1);
});

test("chooseItinerarySameExceptForTotalTravelTime", function () {
  const it0 = {
    travelDays: 2,
    earliestDeparture: 8 * 60,
    latestArrival: 22 * 60,
    longestDailyTravelTime: 10 * 60,
    totalTravelTime: 20 * 60,
  };

  const it1 = {
    travelDays: 2,
    earliestDeparture: 8 * 60,
    latestArrival: 22 * 60,
    longestDailyTravelTime: 10 * 60,
    totalTravelTime: 10 * 60,
  };

  const actual = chooseItinerary([it0, it1]);
  expect(actual).toStrictEqual(1);
});

test("pickConnectionFittingToJourneyFirstOneIsChosen", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "08:01", "city2MainStationId"],
    ["2024-10-15", "08:10", "city3MainStationId"],
  ]);

  const journey = [c1.id];
  const database = new Database([c1, c2, c3]);

  const actual = pickFittingConnection(journey, "City2->City3", database);
  expect(actual).toBe(c2.id);
});

test("pickConnectionFittingToJourneySecondOneIsChosen", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "06:01", "city2MainStationId"],
    ["2024-10-15", "06:10", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "08:01", "city2MainStationId"],
    ["2024-10-15", "08:10", "city3MainStationId"],
  ]);

  const journey = [c1.id];
  const database = new Database([c1, c2, c3]);

  const actual = pickFittingConnection(journey, "City2->City3", database);
  expect(actual).toBe(c3.id);
});

// todo unsorted input data

test("pickConnectionNoFittingMatch", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:01", "city1MainStationId"],
    ["2024-10-15", "08:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "08:01", "city2MainStationId"],
    ["2024-10-15", "08:10", "city3MainStationId"],
  ]);

  const journey = [c1.id];
  const database = new Database([c1, c2, c3]);

  const actual = pickFittingConnection(journey, "City2->City3", database);
  expect([c2.id, c3.id].includes(actual)).toBe(true);
});

test("pickConnectionWrongOrder", function () {
  const c1 = createConnection([
    ["2024-10-15", "09:01", "city1MainStationId"],
    ["2024-10-15", "09:10", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:01", "city2MainStationId"],
    ["2024-10-16", "08:10", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-17", "07:01", "city3MainStationId"],
    ["2024-10-17", "07:10", "city4MainStationId"],
  ]);

  const journey = [c2.id, c1.id];
  const database = new Database([c1, c2, c3]);

  const actual = pickFittingConnection(journey, "City3->City4", database);
  expect(actual).toBe(c3.id);
});
