const {
  getColor,
  prepareDataForMap,
  prepareInitialDataForMap,
} = require("../script/components/componentData.js");
const { Journey, JourneyCollection } = require("../script/types/journey.js");
const { Database } = require("../script/database.js");
const { createConnection, testCities } = require("../tests/data.js");

test("prepareInitialDataForMap", function () {
  const home = "City1";

  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city1ExtraStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city1ExtraStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  // direction inverted
  const c3 = createConnection([
    ["2024-10-15", "06:00", "city3MainStationId"],
    ["2024-10-15", "07:00", "city1ExtraStationId"],
    ["2024-10-15", "09:00", "city1MainStationId"],
  ]);

  const routes = { "City1->City3": [["City1->City3"]] };

  const got = prepareInitialDataForMap(home, testCities, [c1, c2, c3], routes);
  const expCities = {
    geo: {
      cityId1: {
        name: "City1",
        lngLat: [10, 10],
      },
      cityId2: {
        name: "City2",
        lngLat: [20, 20],
      },
      cityId3: {
        name: "City3",
        lngLat: [30, 30],
      },
    },
    defaults: {
      cityId1: {
        rank: 1,
        isVisible: true,
        isHome: true,
        isDestination: false,
        numTransfer: Infinity,
      },
      cityId2: {
        rank: 2,
        isVisible: false,
        isHome: false,
        isDestination: false,
        numTransfer: Infinity,
      },
      cityId3: {
        rank: 2,
        isVisible: true,
        isHome: false,
        isDestination: true,
        numTransfer: 0,
      },
    },
  };
  const expEdges = {
    geo: {
      "City1->City2": {
        startLngLat: [10, 10],
        endLngLat: [20, 20],
      },
      "City2->City3": {
        startLngLat: [20, 20],
        endLngLat: [30, 30],
      },
      "City1->City3": {
        startLngLat: [10, 10],
        endLngLat: [30, 30],
      },
    },
    defaults: {
      "City1->City2": { isVisible: false },
      "City2->City3": { isVisible: false },
      "City1->City3": { isVisible: false },
    },
  };
  expect(got).toStrictEqual([expCities, expEdges]);
});

test("prepareDataForMapEmpty", function () {
  const database = new Database([]);

  const journeys = new JourneyCollection();

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([{}, { mapping: {}, state: {} }, {}]);
});

test("prepareDataForMapNoActiveJourney", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);

  const j1 = new Journey([c1.uniqueId]);
  const journeys = new JourneyCollection();
  journeys.addJourney(j1);

  const expCities = {
    cityId1: { isVisible: true, isStop: true },
    cityId2: { isVisible: true, isStop: true },
    cityId3: { isVisible: true, isStop: true },
  };

  const expEdges = {
    state: {
      "City1->City2": {
        color: null,
        isVisible: true,
        isActive: false,
        leg: "City1->City3",
        journey: j1.id,
      },
      "City2->City3": {
        color: null,
        isVisible: true,
        isActive: false,
        leg: "City1->City3",
        journey: j1.id,
      },
    },
    mapping: {
      "City1->City2": {
        journeys: ["City1->City3"],
        legs: ["City1->City3"],
      },
      "City2->City3": {
        journeys: ["City1->City3"],
        legs: ["City1->City3"],
      },
    },
  };

  const expJourneys = { "City1->City3": j1.summary(database) };

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([expCities, expEdges, expJourneys]);
});

test("prepareDataForMap", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city1ExtraStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "10:00", "city3MainStationId"],
    ["2024-10-15", "11:00", "city4MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "09:00", "city1MainStationId"],
    ["2024-10-15", "10:00", "city2MainStationId"],
    ["2024-10-15", "11:00", "city5MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);

  const j1 = new Journey([c1.uniqueId, c2.uniqueId]);
  const j2 = new Journey([c3.uniqueId]);
  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.addJourney(j2);
  journeys.setActive(j1.id);

  const expCities = {
    cityId1: {
      isStop: true,
      isTransfer: true,
      isVisible: true,
      circleColor: `rgb(${getColor(0)})`,
    },
    cityId2: {
      isStop: true,
      isTransfer: false,
      isVisible: true,
      circleColor: `rgb(${getColor(0)})`,
    },
    cityId3: {
      isStop: true,
      isTransfer: true,
      isVisible: true,
      circleColor: `rgb(${getColor(1)})`,
    },
    cityId4: {
      isStop: true,
      isTransfer: false,
      isVisible: true,
      circleColor: `rgb(${getColor(1)})`,
    },
    cityId5: {
      isStop: true,
      isVisible: true,
    },
  };

  const expEdges = {
    state: {
      "City1->City2": {
        isVisible: true,
        isActive: true,
        color: `rgb(${getColor(0)})`,
        leg: "City1->City3",
        journey: j1.id,
      },
      "City2->City3": {
        isVisible: true,
        isActive: true,
        color: `rgb(${getColor(0)})`,
        leg: "City1->City3",
        journey: j1.id,
      },
      "City3->City4": {
        isVisible: true,
        isActive: true,
        color: `rgb(${getColor(1)})`,
        leg: "City3->City4",
        journey: j1.id,
      },
      "City2->City5": {
        isVisible: true,
        isActive: false,
        color: null,
        leg: "City1->City5",
        journey: j2.id,
      },
    },
    mapping: {
      "City1->City2": {
        journeys: ["City1->City3->City4", "City1->City5"],
        legs: ["City1->City3", "City1->City5"],
      },
      "City2->City3": {
        journeys: ["City1->City3->City4"],
        legs: ["City1->City3"],
      },
      "City2->City5": {
        journeys: ["City1->City5"],
        legs: ["City1->City5"],
      },
      "City3->City4": {
        journeys: ["City1->City3->City4"],
        legs: ["City3->City4"],
      },
    },
  };

  const expJourneys = {
    "City1->City3->City4": j1.summary(database),
    "City1->City5": j2.summary(database),
  };

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([expCities, expEdges, expJourneys]);
});
