/**
 * @jest-environment jsdom
 */

const {
  getJourneySummary,
  prepareDataForJourneySelection,
  Journey,
} = require("../script/componentData.js");
const { createDatabase, testColors } = require("../tests/data.js");

test("getJourneySummaryNoVias", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  // no VIA's
  const journey = new Journey({ "City1-City2": conns[0].id });

  const exp = "From City1 to City2<br/>9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryOneVia", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  // one via
  const journey = new Journey({
    "City1-City2": conns[0].id,
    "City2-City3": conns[1].id,
  });

  const exp = "From City1 to City3 via City2<br/>1h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryTwoVias", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City3 (8:01) -> City4 (8:10) on Day 1",
  ]);

  // two VIA's
  const journey = new Journey({
    "City1-City2": conns[0].id,
    "City2-City3": conns[1].id,
    "City3-City4": conns[2].id,
  });

  const exp = "From City1 to City4 via City2, City3<br/>2h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("prepareDataForJourneySelection", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City1 (9:01) -> City3 (9:10) on Day 2",
  ]);
  const [c1To2_1, c1To2_2, c2To3, c1To3] = conns;

  const journeys = {
    journey1: new Journey({
      "City1-City2": c1To2_1.id,
      "City2-City3": c2To3.id,
    }),
    journey2: new Journey({ "City1-City3": c1To3.id }),
  };
  const active = "journey1";

  const exp = [
    {
      id: "journey1",
      active: true,
      color: testColors.journey1,
      summary: "From City1 to City3 via City2<br/>1h 9min",
    },
    {
      id: "journey2",
      active: false,
      color: testColors.journey2,
      summary: "From City1 to City3<br/>9min",
    },
  ];

  const got = prepareDataForJourneySelection(journeys, active, database);
  expect(got).toStrictEqual(exp);
});
