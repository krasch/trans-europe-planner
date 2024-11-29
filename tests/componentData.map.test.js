/**
 * @jest-environment jsdom
 */

const {
  prepareDataForMap,
  prepareInitialDataForMap,
  getColor,
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
  const expCities = [
    { name: "City1", latitude: 10, longitude: 10 },
    { name: "City2", latitude: 20, longitude: 20 },
    { name: "City3", latitude: 30, longitude: 30 },
  ];
  const expEdges = [
    {
      id: "City1->City2",
      startCity: { name: "City1", latitude: 10, longitude: 10 },
      endCity: { name: "City2", latitude: 20, longitude: 20 },
    },
    {
      id: "City2->City3",
      startCity: { name: "City2", latitude: 20, longitude: 20 },
      endCity: { name: "City3", latitude: 30, longitude: 30 },
    },
    {
      id: "City1->City3",
      startCity: { name: "City1", latitude: 10, longitude: 10 },
      endCity: { name: "City3", latitude: 30, longitude: 30 },
    },
  ];

  expect(got).toStrictEqual([expCities, expEdges]);
});

test("prepareDataForMapEmpty", function () {
  const database = new Database([]);

  const journeys = new JourneyCollection();

  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([[], []]);
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

  const expEdges = [
    {
      id: "City1->City2",
      color: null,
      leg: "City1->City3",
      status: "alternative",
      journey: j1,
      journeyTravelTime: "3h",
    },
    {
      id: "City2->City3",
      color: null,
      leg: "City1->City3",
      status: "alternative",
      journey: j1,
      journeyTravelTime: "3h",
    },
  ];

  const expCities = [
    {
      id: "City1",
      color: null,
      icon: "star_11",
      rank: 3,
      transfer: true,
      active: false,
      stop: true,
    },
    {
      id: "City2",
      color: null,
      transfer: false,
      active: false,
      stop: true,
    },
    {
      id: "City3",
      color: null,
      icon: "star_11",
      rank: 3,
      transfer: true,
      active: false,
      stop: true,
    },
  ];

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

  const expCities = [
    {
      id: "City1",
      color: `rgb(${getColor(0)})`,
      icon: "star_11",
      rank: 3,
      transfer: true,
      active: true,
      stop: true,
    },
    {
      id: "City2",
      color: `rgb(${getColor(0)})`,
      transfer: false,
      active: true,
      stop: true,
    },
    {
      id: "City3",
      color: `rgb(${getColor(0)})`,
      transfer: true,
      icon: "star_11",
      rank: 3,
      active: true,
      stop: true,
    },
    {
      id: "City4",
      color: `rgb(${getColor(1)})`,
      icon: "star_11",
      rank: 3,
      transfer: true,
      active: true,
      stop: true,
    },
    {
      id: "City5",
      color: null,
      icon: "star_11",
      rank: 3,
      transfer: true,
      active: false,
      stop: true,
    },
  ];

  const expEdges = [
    {
      id: "City1->City2",
      color: `rgb(${getColor(0)})`,
      leg: "City1->City3",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    {
      id: "City2->City3",
      color: `rgb(${getColor(0)})`,
      leg: "City1->City3",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    {
      id: "City3->City4",
      color: `rgb(${getColor(1)})`,
      leg: "City3->City4",
      status: "active",
      journey: j1,
      journeyTravelTime: "5h",
    },
    {
      id: "City2->City5",
      color: null,
      leg: "City1->City5",
      status: "alternative",
      journey: j2,
      journeyTravelTime: "2h",
    },
  ];
  const got = prepareDataForMap(journeys, database);
  expect(got).toStrictEqual([expCities, expEdges]);
});
