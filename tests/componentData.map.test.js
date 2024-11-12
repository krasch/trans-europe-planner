/**
 * @jest-environment jsdom
 */

const {
  prepareDataForMap,
  Journey,
  getColor,
} = require("../script/componentData.js");
const { Database } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

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

  const exp = [
    { p2p: "1->2", color: getColor(0), leg: "City1->City3" },
    { p2p: "2->3", color: getColor(0), leg: "City1->City3" },
    { p2p: "3->4", color: getColor(1), leg: "City3->City4" },
  ];
  const got = prepareDataForMap(journeys, active, database);
  expect(got).toStrictEqual(exp);
});
