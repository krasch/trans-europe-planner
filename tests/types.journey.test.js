const { createConnection } = require("../tests/data.js");
const { Journey, JourneyError } = require("../script/types/journey.js");
const { Database } = require("../script/database.js");

test("testDerivedAttributes", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);

  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  expect(journey.connectionIds).toStrictEqual([c1.uniqueId, c2.uniqueId]);
  expect(journey.start).toBe("City1");
  expect(journey.destination).toBe("City3");
});

test("testSetConnectionUnknownLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "07:00", "city2MainStationId"],
    ["2024-10-15", "08:00", "city3MainStationId"],
  ]);

  const journey = new Journey([c1.uniqueId]);
  expect(() => journey.replaceLeg(c2.uniqueId)).toThrow(JourneyError);
});

test("testSetConnectionKnownLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);
  const c2_alt = createConnection([
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-16", "12:00", "city3MainStationId"],
    ["2024-10-16", "13:00", "city4MainStationId"],
  ]);

  const journey = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);
  journey.replaceLeg(c2_alt.uniqueId);

  expect(journey.connectionIds).toStrictEqual([
    c1.uniqueId,
    c2_alt.uniqueId,
    c3.uniqueId,
  ]);
});

test("changeDateSameDay", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-18", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  journey.changeDate(new Date("2024-10-15"), database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: new Date("2024-10-15"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: new Date("2024-10-17"),
    },
  ]);
});

test("changeDateForward", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-18", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  journey.changeDate(new Date("2025-03-01"), database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: new Date("2025-03-01"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: new Date("2025-03-03"),
    },
  ]);
});

test("changeDateBackward", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-18", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  journey.changeDate(new Date("2023-03-01"), database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: new Date("2023-03-01"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: new Date("2023-03-03"),
    },
  ]);
});

test("splitLegUnknownCity", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);

  const database = new Database([c1]);
  const journey = new Journey([c1.uniqueId]);

  const call = () => journey.split("City3", database);
  expect(call).toThrow(Error); // SlicingError but we can not import it..
});

test("splitLegSingleConnection", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);
  const journey = new Journey([c1.uniqueId]);

  journey.split("City2", database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: new Date("2024-10-15"),
    },
    {
      id: c1.id,
      startCityName: "City2",
      endCityName: "City3",
      date: new Date("2024-10-16"),
    },
  ]);
});

test("splitLegAlreadySplit", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-17", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  journey.split("City2", database);
  expect(journey.connectionIds).toStrictEqual([c1.uniqueId, c2.uniqueId]);
});

test("splitLegMiddle", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-17", "09:00", "city3MainStationId"],
    ["2024-10-18", "10:00", "city4MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-19", "08:00", "city4MainStationId"],
    ["2024-10-19", "10:00", "city5MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);

  journey.split("City3", database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: new Date("2024-10-15"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: new Date("2024-10-17"),
    },
    {
      id: c2.id,
      startCityName: "City3",
      endCityName: "City4",
      date: new Date("2024-10-17"),
    },
    {
      id: c3.id,
      startCityName: "City4",
      endCityName: "City5",
      date: new Date("2024-10-19"),
    },
  ]);
});
