const {
  getColor,
  prepareDataForMap,
  prepareInitialDataForMap,
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
      City1: {
        name: "City1",
        lngLat: [10, 10],
      },
      City2: {
        name: "City2",
        lngLat: [20, 20],
      },
      City3: {
        name: "City3",
        lngLat: [30, 30],
      },
    },
    defaults: {
      City1: {
        rank: 1,
      },
      City2: {
        rank: 2,
      },
      City3: {
        rank: 3,
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

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([{}, {}]);
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
    City1: {
      color: null,
      transfer: true,
      active: false,
      stop: true,
    },
    City2: {
      color: null,
      transfer: false,
      active: false,
      stop: true,
    },
    City3: {
      color: null,
      transfer: true,
      active: false,
      stop: true,
      markerSize: "large",
    },
  };

  const expEdges = {
    "City1->City2": {
      color: null,
      leg: "City1->City3",
      status: "alternative",
      journey: j1,
      journeyTravelTime: "3h",
    },
    "City2->City3": {
      color: null,
      leg: "City1->City3",
      status: "alternative",
      journey: j1,
      journeyTravelTime: "3h",
    },
  };

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([expCities, expEdges]);
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
    City1: {
      color: `rgb(${getColor(0)})`,
      transfer: true,
      active: true,
      stop: true,
    },
    City2: {
      color: `rgb(${getColor(0)})`,
      transfer: false,
      active: true,
      stop: true,
    },
    City3: {
      color: `rgb(${getColor(0)})`,
      transfer: true,
      active: true,
      stop: true,
    },
    City4: {
      color: `rgb(${getColor(1)})`,
      transfer: true,
      active: true,
      stop: true,
      markerSize: "large",
    },
    City5: {
      color: null,
      transfer: true,
      active: false,
      stop: true,
      markerSize: "large",
    },
  };

  const expEdges = {
    "City1->City2": {
      color: `rgb(${getColor(0)})`,
      leg: "City1->City3",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    "City2->City3": {
      color: `rgb(${getColor(0)})`,
      leg: "City1->City3",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    "City3->City4": {
      color: `rgb(${getColor(1)})`,
      leg: "City3->City4",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    "City2->City5": {
      color: null,
      leg: "City1->City5",
      status: "alternative",
      journey: j2,
      journeyTravelTime: "2h",
    },
  };

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([expCities, expEdges]);
});
