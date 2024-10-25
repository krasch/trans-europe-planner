/**
 * @jest-environment jsdom
 */

const {
  prepareDataForCalendar,
  Journey,
} = require("../script/componentData.js");
const { createDatabase, testColors } = require("../tests/data.js");

test("prepareDataForCalendar", function () {
  const [database, conns] = createDatabase([
    "City1 (6:01) -> City2 (6:10) on Day 1",
    "City1 (6:01) -> City2 (6:10) on Day 2",
    "City2 (7:01) -> City3 (7:10) on Day 1",
    "City1 (9:01) -> City3 (9:10) on Day 2",
  ]);
  const [c1To2_1, c1To2_2, c2To3, c1To3] = conns;

  // first two conns do the same leg on different days, but only first is used in the journey
  const journeys = {
    journey1: new Journey({
      "City1-City2": c1To2_1.id,
      "City2-City3": c2To3.id,
    }),
    journey2: new Journey({ "City1-City3": c1To3.id }),
  };
  const active = "journey1";

  // only expect legs for the active journey j1
  const exp = [
    {
      id: c1To2_1.id,
      displayId: c1To2_1.id.split("X")[1],
      type: "train",
      leg: "City1-City2",
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c1To2_1.stops[0].departure,
      endDateTime: c1To2_1.stops.at(-1).arrival,
      color: testColors.journey1,
      active: true,
    },
    {
      id: c1To2_2.id,
      displayId: c1To2_2.id.split("X")[1],
      type: "train",
      leg: "City1-City2",
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c1To2_2.stops[0].departure,
      endDateTime: c1To2_2.stops.at(-1).arrival,
      color: testColors.journey1,
      active: false,
    },
    {
      id: c2To3.id,
      displayId: c2To3.id.split("X")[1],
      type: "train",
      leg: "City2-City3",
      startStation: "City 2 Main Station",
      endStation: "City 3 Main Station",
      startDateTime: c2To3.stops[0].departure,
      endDateTime: c2To3.stops.at(-1).arrival,
      color: testColors.journey1,
      active: true,
    },
  ];

  const got = prepareDataForCalendar(journeys, active, database);
  expect(got).toStrictEqual(exp);
});
