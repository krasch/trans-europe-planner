const { Database, getPartialConnection } = require("../script/database.js");

const testCities = {
  city1: { name: "City1" },
  city2: { name: "City2" },
  city3: { name: "City3" },
  city4: { name: "City4" },
};

const testStations = {
  city1MainStation: {
    city: "city1",
    preferred: true,
  },
  city1ExtraStation: {
    city: "city1",
    preferred: false,
  },
  city2MainStation: {
    city: "city2",
    preferred: true,
  },
  city3MainStation: {
    city: "city3",
    preferred: true,
  },
  city3ExtraStation: {
    city: "city3",
    preferred: false,
  },
  city4MainStation: {
    city: "city4",
    preferred: true,
  },
};

test("getPartialConnectionNoSlicingNeeded", function () {
  const stops = [
    { station: "city1MainStation" },
    { station: "city2MainStation" },
    { station: "city3MainStation" },
    { station: "city4MainStation" },
  ];

  const got = getPartialConnection(stops, "city1", "city4", testStations);
  expect(got).toStrictEqual(stops);
});

test("getPartialConnectionRemoveFirstAndLast", function () {
  const stops = [
    { station: "city1MainStation" },
    { station: "city2MainStation" },
    { station: "city3MainStation" },
    { station: "city4MainStation" },
  ];

  const got = getPartialConnection(stops, "city2", "city3", testStations);
  expect(got).toStrictEqual(stops.slice(1, 3));
});

test("getPartialConnectionMultipleStationsPerCity", function () {
  const stops = [
    { station: "city1ExtraStation" },
    { station: "city1MainStation" },
    { station: "city2MainStation" },
    { station: "city3MainStation" },
    { station: "city3ExtraStation" },
    { station: "city4MainStation" },
  ];

  const got = getPartialConnection(stops, "city1", "city3", testStations);
  expect(got).toStrictEqual(stops.slice(1, 4));
});

test("getPartialConnectionStartCityNotIncluded", function () {
  const stops = [
    { station: "city2MainStation" },
    { station: "city3MainStation" },
    { station: "city4MainStation" },
  ];

  const got = getPartialConnection(stops, "city1", "city4", testStations);
  expect(got).toBe(null);
});

test("getPartialConnectionEndCityNotIncluded", function () {
  const stops = [
    { station: "city1MainStation" },
    { station: "city2MainStation" },
    { station: "city3MainStation" },
  ];

  const got = getPartialConnection(stops, "city1", "city4", testStations);
  expect(got).toBe(null);
});

test("getPartialConnectionWrongDirection", function () {
  const stops = [
    { station: "city1MainStation" },
    { station: "city2MainStation" },
    { station: "city3MainStation" },
    { station: "city4MainStation" },
  ];

  const got = getPartialConnection(stops, "city4", "city2", testStations);
  expect(got).toBe(null);
});

test("getConnectionsForLeg", function () {
  const connections = [
    {
      id: "c1",
      type: "train",
      stops: [
        { station: "city1MainStation" },
        { station: "city2MainStation" },
        { station: "city3MainStation" },
        { station: "city4MainStation" },
      ],
    },
    {
      id: "c2",
      type: "train",
      stops: [
        { station: "city1MainStation" },
        { station: "city2MainStation" },
        { station: "city4MainStation" },
      ],
    },
    {
      id: "c3",
      type: "train",
      stops: [
        { station: "city4MainStation" },
        { station: "city1MainStation" },
        { station: "city3MainStation" },
      ],
    },
  ];

  const database = new Database(testCities, testStations, connections);
  const got = database.connectionsForLeg("city1", "city3");

  const exp = [
    {
      id: "c1XCity1-City3",
      type: "train",
      stops: connections[0].stops.slice(0, 3),
    },
    {
      id: "c3XCity1-City3",
      type: "train",
      stops: connections[2].stops.slice(1, 3),
    },
  ];

  expect(got).toStrictEqual(exp);
});
