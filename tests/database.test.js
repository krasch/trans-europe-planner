const {
  Database,
  getPartialStops,
  DatabaseError,
} = require("../script/database.js");
const {
  testCities,
  testStations,
  createConnection,
} = require("../tests/data.js");

test("getPartialStopsNoSlicingNeeded", function () {
  const stops = [
    { station: "city1MainStationId" },
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
    { station: "city4MainStationId" },
  ];

  const got = getPartialStops(stops, 1, 4, testStations);
  expect(got).toStrictEqual(stops);
});

test("getPartialStopsRemoveFirstAndLast", function () {
  const stops = [
    { station: "city1MainStationId" },
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
    { station: "city4MainStationId" },
  ];

  const got = getPartialStops(stops, 2, 3, testStations);
  expect(got).toStrictEqual(stops.slice(1, 3));
});

test("getPartialStopsMultipleStationsPerCity", function () {
  const stops = [
    { station: "city1ExtraStationId" },
    { station: "city1MainStationId" },
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
    { station: "city3ExtraStationId" },
    { station: "city4MainStationId" },
  ];

  const got = getPartialStops(stops, 1, 3, testStations);
  expect(got).toStrictEqual(stops.slice(1, 4));
});

test("getPartialStopsStartCityNotIncluded", function () {
  const stops = [
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
    { station: "city4MainStationId" },
  ];

  const got = getPartialStops(stops, 1, 4, testStations);
  expect(got).toBe(null);
});

test("getPartialStopsEndCityNotIncluded", function () {
  const stops = [
    { station: "city1MainStationId" },
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
  ];

  const got = getPartialStops(stops, 1, 4, testStations);
  expect(got).toBe(null);
});

test("getPartialStopsWrongDirection", function () {
  const stops = [
    { station: "city1MainStationId" },
    { station: "city2MainStationId" },
    { station: "city3MainStationId" },
    { station: "city4MainStationId" },
  ];

  const got = getPartialStops(stops, 4, 2, testStations);
  expect(got).toBe(null);
});

test("getConnectionsForLeg", function () {
  const c1 = createConnection([
    "city1MainStationId",
    "city2MainStationId",
    "city3MainStationId",
    "city4MainStationId",
  ]);

  const c2 = createConnection([
    "city1MainStationId",
    "city2MainStationId",
    "city4MainStationId",
  ]);

  const c3 = createConnection([
    "city4MainStationId",
    "city1MainStationId",
    "city3MainStationId",
  ]);

  const database = new Database(testCities, testStations, [c1, c2, c3]);
  const got = database.connectionsForLeg("City1->City3");

  const c1Leg = `${c1.id}XCity1->City3`;
  const c3Leg = `${c3.id}XCity1->City3`;

  const exp = [
    {
      id: c1Leg,
      name: c1.name,
      leg: "City1->City3",
      type: "train",
      stops: c1.stops.slice(0, 3),
    },
    {
      id: c3Leg,
      name: c3.name,
      leg: "City1->City3",
      type: "train",
      stops: c3.stops.slice(1, 3),
    },
  ];

  expect(got).toStrictEqual(exp);
});

test("unknownCity", function () {
  const database = new Database(testCities, testStations, []);
  expect(() => database.city("badCityIdVeryUnknown")).toThrow(DatabaseError);
});

test("unknownStation", function () {
  const database = new Database(testCities, testStations, []);
  expect(() => database.station("badStationIdVeryUnknown")).toThrow(
    DatabaseError,
  );
});

test("badLegFormat", function () {
  const database = new Database(testCities, testStations, []);
  expect(() => database.connectionsForLeg("badLeg->")).toThrow(DatabaseError);
});

test("unknownCityInLeg", function () {
  const database = new Database(testCities, testStations, []);
  expect(() => database.connectionsForLeg("City1->City1000")).toThrow(
    DatabaseError,
  );
});

test("unknownConnectionId", function () {
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"]);
  const database = new Database(testCities, testStations, []);
  expect(() => database.connection("ABCD")).toThrow(DatabaseError);
});
