/**
 * @jest-environment jsdom
 */

const {
  getJourneySummary,
  prepareDataForJourneySelection,
  Journey,
} = require("../script/componentData.js");
const { Database } = require("../script/database.js");
const { createConnection, testColors } = require("../tests/data.js");

test("getJourneySummaryNoVias", function () {
  const c = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const database = new Database([c]);

  // no VIA's
  const journey = new Journey({ "City1->City2": c.id });

  const exp = "From City1 to City2<br/>9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryOneVia", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2]);

  // one via
  const journey = new Journey({
    "City1->City2": c1.id,
    "City2->City3": c2.id,
  });

  const exp = "From City1 to City3 via City2<br/>1h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryTwoVias", function () {
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

  // two VIA's
  const journey = new Journey({
    "City1->City2": c1.id,
    "City2->City3": c2.id,
    "City3->City4": c3.id,
  });

  const exp = "From City1 to City4 via City2, City3<br/>2h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("prepareDataForJourneySelectionEmpty", function () {
  const database = new Database([]);

  const journeys = {};
  const active = null;

  const got = prepareDataForJourneySelection(journeys, active, database);
  expect(got).toStrictEqual([]);
});

test("prepareDataForJourneySelection", function () {
  const c1To2_1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);
  const c1To2_2 = createConnection([
    ["2024-10-16", "06:01", "city1MainStationId"],
    ["2024-10-16", "06:10", "city2MainStationId"],
  ]);
  const c2To3 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);
  const c1To3 = createConnection([
    ["2024-10-15", "09:01", "city1MainStationId"],
    ["2024-10-15", "09:10", "city3MainStationId"],
  ]);

  const database = new Database([c1To2_1, c1To2_2, c2To3, c1To3]);

  const journeys = {
    journey1: new Journey({
      "City1->City2": c1To2_1.id,
      "City2->City3": c2To3.id,
    }),
    journey2: new Journey({ "City1-City3": c1To3.id }),
  };
  const active = "journey1";

  const exp = [
    {
      id: "journey1",
      active: true,
      summary: "From City1 to City3 via City2<br/>1h 9min",
    },
    {
      id: "journey2",
      active: false,
      summary: "From City1 to City3<br/>9min",
    },
  ];

  const got = prepareDataForJourneySelection(journeys, active, database);
  expect(got).toStrictEqual(exp);
});
