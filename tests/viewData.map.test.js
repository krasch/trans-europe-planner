/**
 * @jest-environment jsdom
 */

const {
  prepareDataForMap,
  prepareInitialDataForMap,
  Journey,
  getColor,
} = require("../script/views/viewData.js");
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

  const journeys = {};
  const active = null;

  const got = prepareDataForMap(journeys, active, database);
  expect(got).toStrictEqual([]);
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

  const journeys = {
    journey1: new Journey({
      "City1->City2": c1.id,
      "City2->City3": c2.id,
    }),
    journey2: new Journey({ "City1->City3": c3.id }),
  };
  const active = "journey1";

  const expCities = [
    { name: "City1", color: getColor(0), transfer: true, active: true },
    { name: "City2", color: getColor(0), transfer: false, active: true },
    { name: "City3", color: getColor(0), transfer: true, active: true },
    { name: "City4", color: getColor(1), transfer: true, active: true },
    { name: "City5", color: null, transfer: true, active: false },
  ];

  const expEdges = [
    {
      id: "City1->City2",
      color: getColor(0),
      leg: "City1->City3",
      status: "active",
      journey: "journey1",
      journeyTravelTime: "5h",
    },
    {
      id: "City2->City3",
      color: getColor(0),
      leg: "City1->City3",
      status: "active",
      journey: "journey1",
      journeyTravelTime: "5h",
    },
    {
      id: "City3->City4",
      color: getColor(1),
      leg: "City3->City4",
      status: "active",
      journey: "journey1",
      journeyTravelTime: "5h",
    },
    {
      id: "City2->City5",
      color: null,
      leg: "City1->City5",
      status: "alternative",
      journey: "journey2",
      journeyTravelTime: "2h",
    },
  ];
  const got = prepareDataForMap(journeys, active, database);
  expect(got).toStrictEqual([expCities, expEdges]);
});
