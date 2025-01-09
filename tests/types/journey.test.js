const { createConnection } = require("../../tests/data.js");
const {
  Journey,
  JourneyError,
  JourneyCollection,
} = require("../../script/types/journey.js");
const { Database } = require("../../script/database.js");
const { DateTime } = require("luxon");

test("testDerivedAttributes", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId]);

  expect(journey.id).toBe("City1->City2->City3");
  expect(journey.connectionIds).toStrictEqual([c1.uniqueId, c2.uniqueId]);
  expect(journey.start).toBe("City1");
  expect(journey.destination).toBe("City3");

  expect(journey.connections(database)).toEqual([c1, c2]);
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

  const database = new Database([c1, c2, c2_alt, c3]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);
  journey.replaceLeg(c2_alt.uniqueId);

  expect(journey.connectionIds).toStrictEqual([
    c1.uniqueId,
    c2_alt.uniqueId,
    c3.uniqueId,
  ]);
  expect(journey.connections(database)).toEqual([c1, c2_alt, c3]);
});

test("shiftDateSameDay", function () {
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

  journey.shiftDate(0, database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: DateTime.fromISO("2024-10-15"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: DateTime.fromISO("2024-10-17"),
    },
  ]);
});

test("shiftDateForward", function () {
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

  journey.shiftDate(3, database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: DateTime.fromISO("2024-10-18"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: DateTime.fromISO("2024-10-20"),
    },
  ]);
});

test("shiftDateBackward", function () {
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

  journey.shiftDate(-4, database);
  expect(journey.connectionIds).toStrictEqual([
    {
      id: c1.id,
      startCityName: "City1",
      endCityName: "City2",
      date: DateTime.fromISO("2024-10-11"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: DateTime.fromISO("2024-10-13"),
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
      date: DateTime.fromISO("2024-10-15"),
    },
    {
      id: c1.id,
      startCityName: "City2",
      endCityName: "City3",
      date: DateTime.fromISO("2024-10-16"),
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
      date: DateTime.fromISO("2024-10-15"),
    },
    {
      id: c2.id,
      startCityName: "City2",
      endCityName: "City3",
      date: DateTime.fromISO("2024-10-17"),
    },
    {
      id: c2.id,
      startCityName: "City3",
      endCityName: "City4",
      date: DateTime.fromISO("2024-10-17"),
    },
    {
      id: c3.id,
      startCityName: "City4",
      endCityName: "City5",
      date: DateTime.fromISO("2024-10-19"),
    },
  ]);
});

test("journeySummaryNoVias", () => {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const database = new Database([c1]);
  const journey = new Journey([c1.uniqueId]);

  // no VIA's
  const exp = {
    from: "City1",
    numTransfer: 0,
    to: "City2",
    travelTime: 9,
    via: [],
  };
  expect(journey.summary(database)).toStrictEqual(exp);
});

test("journeySummaryTwoVias", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);

  const c3 = createConnection([
    ["2024-10-15", "08:01", "city3MainStationId"],
    ["2024-10-15", "08:10", "city4MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);
  const journey = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);

  // no VIA's
  const exp = {
    from: "City1",
    numTransfer: 2,
    to: "City4",
    travelTime: 2 * 60 + 9,
    via: ["City2", "City3"],
  };
  expect(journey.summary(database)).toStrictEqual(exp);
});

test("journeyCollection", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-17", "09:00", "city3MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId]);
  const j2 = new Journey([c2.uniqueId]);

  const journeys = new JourneyCollection();
  const database = new Database([c1, c2]);

  journeys.addJourney(j1);
  journeys.addJourney(j2);
  expect(journeys.hasActiveJourney).toBe(false);
  expect(journeys.activeJourney).toBe(null);
  expect(journeys.journeys).toStrictEqual([j1, j2]);

  journeys.setActive(j2.id);
  expect(journeys.hasActiveJourney).toBe(true);
  expect(journeys.activeJourney).toBe(j2);
  expect(journeys.journeys).toStrictEqual([j1, j2]);

  journeys.reset();
  expect(journeys.hasActiveJourney).toBe(false);
  expect(journeys.activeJourney).toBe(null);
  expect(journeys.journeys).toStrictEqual([]);

  journeys.addJourney(j1);
  journeys.addJourney(j2);
  expect(journeys.hasActiveJourney).toBe(false);
  expect(journeys.activeJourney).toBe(null);
  expect(journeys.journeys).toStrictEqual([j1, j2]);

  journeys.shiftDate(1, database);
  expect(j1.connectionIds[0].date.toISODate()).toBe("2024-10-16");
  expect(j2.connectionIds[0].date.toISODate()).toBe("2024-10-18");
});
