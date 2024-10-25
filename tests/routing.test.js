const {
  cartesianProduct,
  isValidItinerary,
  itinerarySummary,
  chooseItinerary,
  pickFittingConnection,
} = require("../script/routing.js");
const { createDatabase } = require("../tests/data.js");

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
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
  ]);

  const itinerary = [conns[0]];

  expect(isValidItinerary(itinerary)).toBe(true);
});

test("isValidItineraryTwoLegs", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  const itinerary = [conns[0], conns[1]];
  expect(isValidItinerary(itinerary)).toBe(true);
});

test("isValidItineraryTwoLegsSecondLeavesTooEarlySameDay", function () {
  const [database, conns] = createDatabase([
    "City1 (7:01) -> City2 (7:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  const itinerary = [conns[0], conns[1]];
  expect(isValidItinerary(itinerary)).toBe(false);
});

test("isValidItineraryTwoLegsSecondLeavesTooEarlyDayBefore", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  const itinerary = [conns[0], conns[1]];
  expect(isValidItinerary(itinerary)).toBe(false);
});

test("itinerarySummaryOneTravelDay", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  const itinerary = [conns[0], conns[1]];

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
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (6:01) -> City1 (6:10) on Day 2",
    "City1 (9:01) -> City3 (9:10) on Day 2",
    "City3 (6:01) -> City4 (6:10) on Day 3",
  ]);

  const itinerary = [conns[0], conns[1], conns[2], conns[3]];

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
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City3 (6:01) -> City4 (6:10) on Day 3",
  ]);

  const itinerary = [conns[0], conns[1]];

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
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City2 (8:01) -> City3 (8:10) on Day 1",
  ]);

  const journey = [conns[0].id];

  const actual = pickFittingConnection(journey, "City2-City3", database);
  expect(actual).toBe(conns[1].id);
});

test("pickConnectionFittingToJourneySecondOneIsChosen", function () {
  const [database, conns] = createDatabase([
    "City1 (7:01) -> City2 (7:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City2 (8:01) -> City3 (8:10) on Day 1",
  ]);

  const journey = [conns[0].id];

  const actual = pickFittingConnection(journey, "City2-City3", database);
  expect(actual).toBe(conns[2].id);
});

// todo unsorted input data

test("pickConnectionNoFittingMatch", function () {
  const [database, conns] = createDatabase([
    "City1 (8:01) -> City2 (8:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City2 (8:01) -> City3 (8:10) on Day 1",
  ]);

  const journey = [conns[0].id];

  const actual = pickFittingConnection(journey, "City2-City3", database);
  expect([conns[1].id, conns[2].id].includes(actual)).toBe(true);
});

test("pickConnectionWrongOrder", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City3 (8:01) -> City4 (8:10) on Day 1",
  ]);

  const journey = [conns[1].id, conns[0].id];

  const actual = pickFittingConnection(journey, "City3-City4", database);
  expect(actual).toBe(conns[2].id);
});
