const {
  getColor,
  prepareDataForMap,
  prepareInitialDataForMap,
  getJourneySummary,
} = require("../script/components/componentData.js");
const { JourneyCollection } = require("../script/types/journey.js");
const { Database } = require("../script/database.js");
const { createConnection, testCities } = require("../tests/data.js");

test("prepareInitialDataForMap", function () {
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

  const got = prepareInitialDataForMap(testCities, [c1, c2, c3]);
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
        menuDestination: false,
      },
      cityId2: {
        rank: 2,
        menuDestination: false,
      },
      cityId3: {
        rank: 3,
        menuDestination: true,
        markerIcon: "destination",
        markerSize: "small",
        markerColor: "light",
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
      "City1->City2": {},
      "City2->City3": {},
      "City1->City3": {},
    },
  };
  expect(got).toStrictEqual([expCities, expEdges]);
});

test("prepareDataForMapEmpty", function () {
  const database = new Database([]);

  const journeys = new JourneyCollection();

  const got = prepareDataForMap(null, journeys, database);
  expect(got).toStrictEqual([{}, { mapping: {}, state: {} }, {}]);
});

test("prepareDataForMapNoActiveJourney", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);

  const journeys = new JourneyCollection();

  const j1 = journeys.addJourney([c1.id]);

  const expCities = {
    cityId1: {
      circleVisible: true,
      markerIcon: "home",
      markerSize: "large",
      markerColor: "dark",
    },
    cityId2: { circleVisible: true },
    cityId3: {
      circleVisible: true,
      markerSize: "large",
      markerColor: "dark",
    },
  };

  const expEdges = {
    state: {
      "City1->City2": {
        visible: true,
        active: false,
        leg: "City1->City3",
        journey: j1,
      },
      "City2->City3": {
        visible: true,
        active: false,
        leg: "City1->City3",
        journey: j1,
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

  const expJourneys = { "City1->City3": getJourneySummary([c1]) };

  const got = prepareDataForMap("City1", journeys, database);
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

  const journeys = new JourneyCollection();
  const j1 = journeys.addJourney([c1.id, c2.id]);
  const j2 = journeys.addJourney([c3.id]);
  journeys.setActive(j1);

  const expCities = {
    cityId1: {
      circleVisible: true,
      circleColor: `rgb(${getColor(0)})`,
      markerIcon: "home",
      markerSize: "large",
      markerColor: "dark",
    },
    cityId2: {
      circleVisible: true,
      circleColor: `rgb(${getColor(0)})`,
    },
    cityId3: {
      circleVisible: true,
      circleColor: `rgb(${getColor(0)})`,
    },
    cityId4: {
      circleVisible: true,
      circleColor: `rgb(${getColor(1)})`,
      markerSize: "large",
      markerColor: "dark",
    },
    cityId5: {
      markerSize: "large",
      markerColor: "dark",
      circleVisible: true,
    },
  };

  const expEdges = {
    state: {
      "City1->City2": {
        visible: true,
        active: true,
        color: `rgb(${getColor(0)})`,
        leg: "City1->City3",
        journey: j1,
      },
      "City2->City3": {
        visible: true,
        active: true,
        color: `rgb(${getColor(0)})`,
        leg: "City1->City3",
        journey: j1,
      },
      "City3->City4": {
        visible: true,
        active: true,
        color: `rgb(${getColor(1)})`,
        leg: "City3->City4",
        journey: j1,
      },
      "City2->City5": {
        visible: true,
        active: false,
        leg: "City1->City5",
        journey: j2,
      },
    },
    mapping: {
      "City1->City2": {
        journeys: ["City1->City3;City3->City4", "City1->City5"],
        legs: ["City1->City3", "City1->City5"],
      },
      "City2->City3": {
        journeys: ["City1->City3;City3->City4"],
        legs: ["City1->City3"],
      },
      "City2->City5": {
        journeys: ["City1->City5"],
        legs: ["City1->City5"],
      },
      "City3->City4": {
        journeys: ["City1->City3;City3->City4"],
        legs: ["City3->City4"],
      },
    },
  };

  const expJourneys = {
    "City1->City3;City3->City4": getJourneySummary([c1, c2]),
    "City1->City5": getJourneySummary([c3]),
  };

  const got = prepareDataForMap("City1", journeys, database);
  expect(got).toStrictEqual([expCities, expEdges, expJourneys]);
});
