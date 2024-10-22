const { Database } = require("../script/database.js");
const {
  createItineraryForRoute,
  CreatingItineraryNotPossible,
} = require("../script/routing.js");
const { CustomDateTime } = require("../script/util.js");
const {
  testCities,
  testStations,
  createConnection,
} = require("../tests/data.js");

test("createItinerarySingleLegSingleConnection", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const database = new Database(testCities, testStations, [c1]);

  const start = c1.stops[0].departure;
  const got = createItineraryForRoute(["City1-City2"], start, database);
  const exp = [`${c1.id}XCity1-City2`];

  expect(got).toStrictEqual(exp);
});

test("createItinerarySingleLegSingleConnectionNoStartGiven", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const database = new Database(testCities, testStations, [c1]);

  const start = null;
  const route = ["City1-City2"];

  const got = createItineraryForRoute(route, start, database);
  const exp = [`${c1.id}XCity1-City2`];

  expect(got).toStrictEqual(exp);
});

test("createItinerarySingleLegSingleConnectionTooEarly", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const c2 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    8, // departs at 08:01 and arrives at 08:10
  );
  // only adding c1 to database
  const database = new Database(testCities, testStations, [c1]);

  const start = c2.stops[0].departure; // looking for departures >= c2
  const route = ["City1-City2"];
  const f = () => createItineraryForRoute(route, start, database);
  expect(f).toThrow(CreatingItineraryNotPossible);
});

test("createItinerarySingleLegTwoConnectionsUseFirst", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const c2 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    8, // departs at 08:01 and arrives at 08:10
  );
  const database = new Database(testCities, testStations, [c1, c2]);

  const start = c1.stops[0].departure;
  const route = ["City1-City2"];

  const got = createItineraryForRoute(route, start, database);
  const exp = [`${c1.id}XCity1-City2`];

  expect(got).toStrictEqual(exp);
});

test("createItinerarySingleLegTwoConnectionsUseSecond", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const c2 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    8, // departs at 08:01 and arrives at 08:10
  );
  const database = new Database(testCities, testStations, [c1, c2]);

  const start = c2.stops[0].departure;
  const route = ["City1-City2"];

  const got = createItineraryForRoute(route, start, database);
  const exp = [`${c2.id}XCity1-City2`];

  expect(got).toStrictEqual(exp);
});

test("createItineraryMultipleLegsOneConnectionEach", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const c2 = createConnection(
    ["city2MainStationId", "city3MainStationId"],
    7, // departs at 07:01 and arrives at 07:10
  );
  const c3 = createConnection(
    ["city3MainStationId", "city4MainStationId"],
    8, // departs at 08:01 and arrives at 08:10
  );
  const database = new Database(testCities, testStations, [c1, c2, c3]);

  const start = null;
  const route = ["City1-City2", "City2-City3", "City3-City4"];

  const got = createItineraryForRoute(route, start, database);
  const exp = [
    `${c1.id}XCity1-City2`,
    `${c2.id}XCity2-City3`,
    `${c3.id}XCity3-City4`,
  ];

  expect(got).toStrictEqual(exp);
});

test("createItineraryMultipleLegsOneConnectionEachOneTooLate", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6, // departs at 06:01 and arrives at 06:10
  );
  const c2 = createConnection(
    ["city2MainStationId", "city3MainStationId"],
    9, // departs at 09:01 and arrives at 09:10
  );
  const c3 = createConnection(
    ["city3MainStationId", "city4MainStationId"],
    8, // departs at 08:01 and arrives at 08:10
  );
  const database = new Database(testCities, testStations, [c1, c2, c3]);

  const start = null;
  const route = ["City1-City2", "City2-City3", "City3-City4"];

  const f = () => createItineraryForRoute(route, start, database);
  expect(f).toThrow(CreatingItineraryNotPossible);
});

test("createItineraryMultipleDays", function () {
  const c1 = createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6,
    "2024-10-15",
  );
  const c2 = createConnection(
    ["city2MainStationId", "city3MainStationId"],
    8,
    "2024-10-16",
  );

  const database = new Database(testCities, testStations, [c1, c2]);

  const start = null;
  const route = ["City1-City2", "City2-City3"];

  const got = createItineraryForRoute(route, start, database);
  const exp = [`${c1.id}XCity1-City2`, `${c2.id}XCity2-City3`];

  expect(got).toStrictEqual(exp);
});
