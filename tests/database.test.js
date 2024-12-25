const {
  Database,
  DatabaseError,
  isSlicingError,
} = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

test("getConnectionEmptyDatabase", function () {
  const database = new Database([]);
  const call = () =>
    database.connection("id", new Date("2024-10-03"), "City1", "City2");

  expect(call).toThrow(DatabaseError);
});

test("getConnectionBadLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const database = new Database([c1]);
  const call = () =>
    database.connection(c1.id, "City1", "City3", new Date("2024-10-03"));

  expect(call).toThrow(Error);
  // workaround because we can't import SlicingError due to testing setup
  try {
    call();
  } catch (error) {
    expect(isSlicingError(error)).toBe(true);
  }
});

test("getConnectionSameSliceSameDate", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.connection(
    c1.id,
    "City1",
    "City3",
    new Date("2024-10-15"),
  );

  expect(got).toEqual(c1);
});

test("getConnectionDifferentSliceSameDate", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.connection(
    c1.id,
    "City1",
    "City2",
    new Date("2024-10-15"),
  );

  const exp = c1.slice("City1", "City2");
  expect(got).toEqual(exp);
});

test("getConnectionDifferentSliceDifferentDate", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.connection(
    c1.id,
    "City1",
    "City2",
    new Date("2024-10-22"),
  );

  const exp = c1.slice("City1", "City2").changeDate(new Date("2024-10-22"));
  expect(got).toStrictEqual(exp);
});

test("getConnectionsForLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const c3 = createConnection([
    ["2024-10-15", "08:00", "city4MainStationId"],
    ["2024-10-16", "09:00", "city1MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);

  const queryDates = [
    new Date("2024-10-15"), // same date as used in connections
    new Date("2024-09-01"), // earlier date
    new Date("2024-11-24"), // later date
  ];
  const got = database.connectionsForLeg("City1", "City3", queryDates);

  const exp = [
    c1.slice("City1", "City3"),
    c1.slice("City1", "City3").changeDate(queryDates[1]),
    c1.slice("City1", "City3").changeDate(queryDates[2]),
    c3.slice("City1", "City3").changeDate(queryDates[0]),
    c3.slice("City1", "City3").changeDate(queryDates[1]),
    c3.slice("City1", "City3").changeDate(queryDates[2]),
  ];
  expect(got).toEqual(exp);
});
