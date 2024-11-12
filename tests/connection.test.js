const { Connection } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

test("connection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);

  expect(connection.id).toBe("1X2024-10-15XCity1->City3");
  expect(connection.leg).toBe("City1->City3");
  expect(connection.start).toStrictEqual(connection.stops[0]);
  expect(connection.end).toStrictEqual(connection.stops.at(-1));
});

test("connectionNotOvernight", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  expect(connection.isMultiday).toBe(false);
});

test("connectionOvernight", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  expect(connection.isMultiday).toBe(true);
});

test("sliceNoSlicingNeeded", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const got = connection.slice("City1", "City3");
  const exp = connection;

  expect(got).toStrictEqual(exp);
});

test("sliceRemoveFirstAndLast", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const got = connection.slice("City2", "City3");
  const exp = new Connection(
    connection.baseId,
    connection.name,
    connection.type,
    connection.stops.slice(1, 3),
  );

  expect(got).toStrictEqual(exp);
});

test("sliceMultipleStationsPerCity", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1ExtraStationId"],
    ["2024-10-16", "09:00", "city1MainStationId"],
    ["2024-10-16", "10:00", "city2MainStationId"],
    ["2024-10-17", "11:00", "city3MainStationId"],
    ["2024-10-17", "12:00", "city3ExtraStationId"],
    ["2024-10-17", "13:00", "city4MainStationId"],
  ]);

  const got = connection.slice("City1", "City3");
  const exp = new Connection(
    connection.baseId,
    connection.name,
    connection.type,
    connection.stops.slice(1, 4),
  );

  expect(got).toStrictEqual(exp);
});

test("sliceStartStationNotIncluded", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const got = connection.slice("City3", "City1");
  expect(got).toBe(null);
});

test("sliceEndStationNotIncluded", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const got = connection.slice("City1", "City3");
  expect(got).toBe(null);
});

test("sliceWrongDirection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const got = connection.slice("City2", "City1");
  expect(got).toBe(null);
});

test("testPointToPoint", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city1ExtraStationId"],
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
    ["2024-10-15", "12:00", "city3ExtraStationId"],
  ]);

  const got = connection.pointToPoint;
  expect(got).toStrictEqual(["1->2", "2->3"]);
});
