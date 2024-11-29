const { Database } = require("../script/database.js");
const { Leg } = require("../script/types/connection.js");
const { createConnection } = require("../tests/data.js");

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
  const got = database.connectionsForLeg(new Leg("City1", "City3"));

  const exp = [c1.slice("City1", "City3"), c3.slice("City1", "City3")];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkNoConnections", function () {
  const database = new Database([]);
  const got = database.localNetwork("City2");

  const exp = [];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkNoMatches", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.localNetwork("City3");

  const exp = [];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkCityAtEnd", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.localNetwork("City2");

  const exp = [c1.trace];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkCityInMiddle", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const database = new Database([c1]);
  const got = database.localNetwork("City2");

  const exp = [
    c1.slice("City1", "City2").trace,
    c1.slice("City2", "City4").trace,
  ];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkAlternativeRoutes", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "10:00", "city2MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const got = database.localNetwork("City2");

  const exp = [
    c1.slice("City1", "City2").trace,
    c1.slice("City2", "City4").trace,
    c2.trace,
  ];
  expect(got).toStrictEqual(exp);
});

test("getLocalNetworkDuplicateRoutes", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "10:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const got = database.localNetwork("City2");

  const exp = [
    c1.slice("City1", "City2").trace,
    c1.slice("City2", "City4").trace,
  ];
  expect(got).toStrictEqual(exp);
});
