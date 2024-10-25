/**
 * @jest-environment jsdom
 */

const {
  getJourneySummary,
  prepareDataForCalendar,
  prepareDataForJourneySelection,
  prepareDataForMap,
  Journey,
} = require("../script/componentData.js");
const { createDatabase } = require("../tests/data.js");

// todo should be taken from componentData directly
const testColors = {
  journey1: "0, 255, 0",
  journey2: "255, 0, 0",
  journey3: "0, 0, 255",
};

function createJourney(connectionsByLeg) {
  const connectionIdsByLeg = {};
  for (let leg in connectionsByLeg)
    connectionIdsByLeg[leg] = `${connectionsByLeg[leg].id}`;
  return new Journey(connectionIdsByLeg);
}

test("getJourneySummaryNoVias", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  // no VIA's
  const journey = createJourney({
    "City1-City2": Object.values(database.connectionsForLeg("City1-City2"))[0],
  });

  const exp = "From City1 to City2<br/>9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryOneVia", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
  ]);

  // one via
  const journey = createJourney({
    "City1-City2": Object.values(database.connectionsForLeg("City1-City2"))[0],
    "City2-City3": Object.values(database.connectionsForLeg("City2-City3"))[0],
  });

  const exp = "From City1 to City3 via City2<br/>1h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryTwoVias", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City3 (8:01) -> City4 (8:10) on Day 1",
  ]);

  // two VIA's
  const journey = createJourney({
    "City1-City2": Object.values(database.connectionsForLeg("City1-City2"))[0],
    "City2-City3": Object.values(database.connectionsForLeg("City2-City3"))[0],
    "City3-City4": Object.values(database.connectionsForLeg("City3-City4"))[0],
  });

  const exp = "From City1 to City4 via City2, City3<br/>2h 9min";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("prepareDataForCalendar", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City3 (8:01) -> City4 (8:10) on Day 1",
  ]);

  const c1 = Object.values(database.connectionsForLeg("City1-City2"))[0];
  const c2 = Object.values(database.connectionsForLeg("City1-City2"))[1];
  const c3 = Object.values(database.connectionsForLeg("City2-City3"))[0];
  const c4 = Object.values(database.connectionsForLeg("City3-City4"))[0];

  // c1 and c2 do the same leg on different days, only c1 is used in the journey
  const journeys = {
    journey1: createJourney({
      "City1-City2": c1,
      "City2-City3": c3,
    }),
    journey2: createJourney({
      "City3-City4": c4,
    }),
  };
  const active = "journey1";

  // only expect connections for the active journey j1
  const exp = [
    {
      id: `${c1.id}`,
      displayId: c1.id.split("X")[1],
      type: "train",
      leg: "City1-City2",
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c1.stops[0].departure,
      endDateTime: c1.stops.at(-1).arrival,
      color: testColors.journey1,
      active: true,
    },
    {
      id: `${c2.id}`,
      displayId: c2.id.split("X")[1],
      type: "train",
      leg: "City1-City2",
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c2.stops[0].departure,
      endDateTime: c2.stops.at(-1).arrival,
      color: testColors.journey1,
      active: false,
    },
    {
      id: `${c3.id}`,
      displayId: c3.id.split("X")[1],
      type: "train",
      leg: "City2-City3",
      startStation: "City 2 Main Station",
      endStation: "City 3 Main Station",
      startDateTime: c3.stops[0].departure,
      endDateTime: c3.stops.at(-1).arrival,
      color: testColors.journey1,
      active: true,
    },
  ];

  const got = prepareDataForCalendar(journeys, active, database);
  expect(got).toStrictEqual(exp);
});

test("prepareDataForJourneySelection", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City1 (9:01) -> City3 (9:10) on Day 2",
  ]);

  const c1 = Object.values(database.connectionsForLeg("City1-City2"))[0];
  const c2 = Object.values(database.connectionsForLeg("City1-City2"))[1];
  const c3 = Object.values(database.connectionsForLeg("City2-City3"))[0];
  const c4 = Object.values(database.connectionsForLeg("City1-City3"))[0];

  const journeys = {
    journey1: createJourney({ "City1-City2": c1, "City2-City3": c3 }),
    journey2: createJourney({ "City1-City3": c4 }),
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

test("prepareDataForMap", function () {
  const database = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City1 (9:01) -> City3 (9:10) on Day 2",
  ]);

  // c1 and c2 do the same leg at different hours, only c1 is used in the journey
  const c1 = Object.values(database.connectionsForLeg("City1-City2"))[0];
  const c2 = Object.values(database.connectionsForLeg("City1-City2"))[1];
  const c3 = Object.values(database.connectionsForLeg("City2-City3"))[0];
  const c4 = Object.values(database.connectionsForLeg("City1-City3"))[0];

  const journeys = {
    journey1: createJourney({ "City1-City2": c1, "City2-City3": c3 }),
    journey2: createJourney({ "City1-City3": c4 }),
  };
  const active = "journey1";

  const exp = [
    {
      id: "City1-City2",
      startCity: {
        name: "City1",
        latitude: 10,
        longitude: 10,
      },
      endCity: {
        name: "City2",
        latitude: 20,
        longitude: 20,
      },
      active: true,
    },
    {
      id: "City2-City3",
      startCity: {
        name: "City2",
        latitude: 20,
        longitude: 20,
      },
      endCity: {
        name: "City3",
        latitude: 30,
        longitude: 30,
      },
      active: true,
    },
    {
      id: "City1-City3",
      startCity: {
        name: "City1",
        latitude: 10,
        longitude: 10,
      },
      endCity: {
        name: "City3",
        latitude: 30,
        longitude: 30,
      },
      active: false,
    },
  ];
  const got = prepareDataForMap(journeys, active, database);
  expect(got).toStrictEqual([exp, testColors.journey1]);
});
