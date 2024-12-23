const {
  Connection,
  ConnectionId,
  Leg,
  SlicingError,
} = require("../script/types/connection.js");
const { createConnection } = require("../tests/data.js");

test("connection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
    ["2024-10-15", "10:00", "city3MainStationId"],
  ]);

  expect(connection.id).toStrictEqual(
    ConnectionId.fromString("1XXX2024-10-15XXXCity1->City3"),
  );
  expect(connection.leg).toStrictEqual(Leg.fromString("City1->City3"));
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
    connection.id.train,
    connection.id.date,
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
    connection.id.train,
    connection.id.date,
    connection.name,
    connection.type,
    connection.stops.slice(1, 4),
  );

  expect(got).toStrictEqual(exp);
});

test("sliceStartStationNotInConnection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  expect(() => connection.slice("City3", "City1")).toThrow(SlicingError);
});

test("sliceEndStationNotInConnection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  expect(() => connection.slice("City3", "City1")).toThrow(SlicingError);
});

test("sliceWrongDirection", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  expect(() => connection.slice("City2", "City1")).toThrow(SlicingError);
});

test("hasStop", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city1ExtraStationId"],
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
    ["2024-10-15", "12:00", "city3ExtraStationId"],
  ]);

  expect(connection.hasStop("City1")).toBe(true);
  expect(connection.hasStop("City2")).toBe(true);
  expect(connection.hasStop("City3")).toBe(true);
  expect(connection.hasStop("City4")).toBe(false);
});

test("testEdges", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city1ExtraStationId"],
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
    ["2024-10-15", "12:00", "city3ExtraStationId"],
  ]);

  const got = connection.edges;
  const exp = [new Leg("City1", "City2"), new Leg("City2", "City3")];

  expect(got).toStrictEqual(exp);
});

test("testCities", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city1ExtraStationId"],
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
    ["2024-10-15", "12:00", "city3ExtraStationId"],
  ]);

  const got = connection.cities;
  const exp = ["City1", "City2", "City3"];

  expect(got).toStrictEqual(exp);
});
