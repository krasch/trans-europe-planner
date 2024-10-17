/**
 * @jest-environment jsdom
 */

const { Database } = require("../script/database.js");
const {
  getJourneySummary,
  prepareDataForCalendar,
  prepareDataForJourneySelection,
  prepareDataForMap,
  Journey,
} = require("../script/componentData.js");
const {
  testCities,
  testStations,
  createConnection,
} = require("../tests/data.js");

// todo should be taken from componentData directly
const testColors = {
  journey1: "0, 255, 0",
  journey2: "255, 0, 0",
  journey3: "0, 0, 255",
};

function createJourney(items) {
  const defaults = {};
  for (let leg in items) defaults[leg] = `${items[leg].id}X${leg}`;
  return Journey.fromDefaults(defaults);
}

test("getJourneySummaryNoVias", function () {
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"]);
  const c2 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c3 = createConnection(["city3MainStationId", "city4MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3]);

  // no VIA's
  const journey = createJourney({ "City1-City2": c1 });

  const exp = "From City1 to City2";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryOneVia", function () {
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"]);
  const c2 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c3 = createConnection(["city3MainStationId", "city4MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3]);

  // no VIA's
  const journey = createJourney({ "City1-City2": c1, "City2-City3": c2 });

  const exp = "From City1 to City3 via City2";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("getJourneySummaryTwoVias", function () {
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"]);
  const c2 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c3 = createConnection(["city3MainStationId", "city4MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3]);

  // two vias
  const journey = createJourney({
    "City1-City2": c1,
    "City2-City3": c2,
    "City3-City4": c3,
  });

  const exp = "From City1 to City4 via City2, City3";
  expect(getJourneySummary(journey, database)).toStrictEqual(exp);
});

test("prepareDataForCalendar", function () {
  // c1 and c2 do the same leg at different hours, only c1 is used in the journey
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"], 14);
  const c2 = createConnection(["city1MainStationId", "city2MainStationId"], 15);
  const c3 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c4 = createConnection(["city1MainStationId", "city3MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3, c4]);

  const journeys = {
    journey1: createJourney({ "City1-City2": c1, "City2-City3": c3 }),
    journey2: createJourney({ "City1-City3": c4 }),
  };
  const active = "journey1";

  // only expect connections for the active journey j1
  const exp = [
    {
      id: `${c1.id}XCity1-City2`,
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
      id: `${c2.id}XCity1-City2`,
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
      id: `${c3.id}XCity2-City3`,
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
  // c1 and c2 do the same leg at different hours, only c1 is used in the journey
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"], 14);
  const c2 = createConnection(["city1MainStationId", "city2MainStationId"], 15);
  const c3 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c4 = createConnection(["city1MainStationId", "city3MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3, c4]);

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
      summary: "From City1 to City3 via City2",
    },
    {
      id: "journey2",
      active: false,
      color: testColors.journey2,
      summary: "From City1 to City3",
    },
  ];

  const got = prepareDataForJourneySelection(journeys, active, database);
  expect(got).toStrictEqual(exp);
});

test("prepareDataForMap", function () {
  // c1 and c2 do the same leg at different hours, only c1 is used in the journey
  const c1 = createConnection(["city1MainStationId", "city2MainStationId"], 14);
  const c2 = createConnection(["city1MainStationId", "city2MainStationId"], 15);
  const c3 = createConnection(["city2MainStationId", "city3MainStationId"]);
  const c4 = createConnection(["city1MainStationId", "city3MainStationId"]);

  const database = new Database(testCities, testStations, [c1, c2, c3, c4]);

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
