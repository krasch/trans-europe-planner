import { DateTime } from "luxon";
import { createConnection } from "tests/_data.js";
import { Connection, SlicingError } from "/script/data/types/connection.js";

test("derivedAttributes", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const departure = DateTime.fromISO("2024-10-15T08:00");
  const arrival = DateTime.fromISO("2024-10-15T09:00");

  expect(connection.startCityName).toStrictEqual("City1");
  expect(connection.endCityName).toStrictEqual("City2");
  expect(connection.startStationName).toStrictEqual("City 1 Main Station");
  expect(connection.endStationName).toStrictEqual("City 2 Main Station");

  expect(connection.departure).toStrictEqual(departure);
  expect(connection.arrival).toStrictEqual(arrival);
  expect(connection.travelTime).toStrictEqual(60);

  expect(connection.uniqueId.id).toBe("c1");
  expect(connection.uniqueId.date.toISODate()).toStrictEqual("2024-10-15");
  expect(connection.uniqueId.startCityName).toStrictEqual("City1");
  expect(connection.uniqueId.endCityName).toStrictEqual("City2");
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

test("changeDateNoChange", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const got = connection.changeDate(DateTime.fromISO("2024-10-15"));
  expect(got.id).toStrictEqual(connection.id);
  expect(got.departure).toStrictEqual(connection.departure);
  expect(got.arrival).toStrictEqual(connection.arrival);
});

test("changeDateForward", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const got = connection.changeDate(DateTime.fromISO("2024-11-02"));
  const exp = createConnection(
    [
      ["2024-11-02", "08:00", "city1MainStationId"],
      ["2024-11-03", "09:00", "city2MainStationId"],
    ],
    connection.id,
  );

  expect(got).toStrictEqual(exp);
});

test("changeDateBackward", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const got = connection.changeDate(DateTime.fromISO("2024-02-10"));
  const exp = createConnection(
    [
      ["2024-02-10", "08:00", "city1MainStationId"],
      ["2024-02-11", "09:00", "city2MainStationId"],
    ],
    connection.id,
  );

  expect(got).toStrictEqual(exp);
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
    connection.id,
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
    connection.id,
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

test("transferTime", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const connection2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-20", "09:00", "city3MainStationId"],
  ]);

  const exp = 47 * 60;
  const got = connection.transferTime(connection2);

  expect(got).toBe(exp);
});

test("transferTimeNextEarlier", function () {
  const connection = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const connection2 = createConnection([
    ["2024-10-15", "07:00", "city2MainStationId"],
    ["2024-10-15", "08:00", "city3MainStationId"],
  ]);

  const exp = -120;
  const got = connection.transferTime(connection2);

  expect(got).toBe(exp);
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
  const exp = [
    { startCityName: "City1", endCityName: "City2" },
    { startCityName: "City2", endCityName: "City3" },
  ];

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
