/**
 * @jest-environment jsdom
 */

const {
  prepareDataForMap,
  prepareInitialDataForMap,
  Journey,
  getColor,
} = require("../script/componentData.js");
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
  const expLegs = [
    {
      leg: "City1->City2",
      startCity: { name: "City1", latitude: 10, longitude: 10 },
      endCity: { name: "City2", latitude: 20, longitude: 20 },
    },
    {
      leg: "City2->City3",
      startCity: { name: "City2", latitude: 20, longitude: 20 },
      endCity: { name: "City3", latitude: 30, longitude: 30 },
    },
    {
      leg: "City1->City3",
      startCity: { name: "City1", latitude: 10, longitude: 10 },
      endCity: { name: "City3", latitude: 30, longitude: 30 },
    },
  ];

  expect(got).toStrictEqual([expCities, expLegs]);
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
  /*const c3 = createConnection([
    ["2024-10-15", "09:00", "city1MainStationId"],
    ["2024-10-15", "10:00", "city3ExtraStationId"],
    ["2024-10-15", "11:00", "city3MainStationId"],
  ]);*/

  const database = new Database([c1, c2]);

  const journeys = {
    journey1: new Journey({
      "City1->City2": c1.id,
      "City2->City3": c2.id,
    }),
    // journey2: new Journey({ "City1->City3": c3.id }),
  };
  const active = "journey1";

  const expCities = [
    { city: "City1", color: getColor(0) },
    { city: "City2", color: getColor(0) },
    { city: "City3", color: getColor(0) },
    { city: "City4", color: getColor(1) },
  ];

  const expLegs = [
    { leg: "City1->City2", color: getColor(0), parent: "City1->City3" },
    { leg: "City2->City3", color: getColor(0), parent: "City1->City3" },
    { leg: "City3->City4", color: getColor(1), parent: "City3->City4" },
  ];
  const got = prepareDataForMap(journeys, active, database);
  console.log(got);
  expect(got).toStrictEqual([expCities, expLegs]);
});
