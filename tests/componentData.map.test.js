/**
 * @jest-environment jsdom
 */

const { prepareDataForMap, Journey } = require("../script/componentData.js");
const { createDatabase, testColors } = require("../tests/data.js");

test("prepareDataForMap", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City1 (9:01) -> City3 (9:10) on Day 2",
  ]);
  const [c1To2_1, c1To2_2, c2To3, c1To3] = conns;

  // c1 and c2 do the same leg at different hours, only c1 is used in the journey
  const journeys = {
    journey1: new Journey({
      "City1->City2": c1To2_1.id,
      "City2->City3": c2To3.id,
    }),
    journey2: new Journey({ "City1->City3": c1To3.id }),
  };
  const active = "journey1";

  const exp = [
    {
      id: "City1->City2",
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
      id: "City2->City3",
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
      id: "City1->City3",
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
