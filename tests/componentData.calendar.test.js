/**
 * @jest-environment jsdom
 */

const {
  prepareDataForCalendar,
  getColor,
} = require("../script/components/componentData.js");
const { JourneyCollection } = require("../script/types/journey.js");
const { Database } = require("../script/database.js");
const { createConnection } = require("../tests/data.js");

test("prepareDataForCalendarEmpty", function () {
  const database = new Database([]);
  const journeys = new JourneyCollection();

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toStrictEqual([]);
});

test("prepareDataForCalendarNoActiveJourney", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney({ "City1->City3": c1.id });

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toStrictEqual([]);
});

test("prepareDataForCalendar", function () {
  const c1To2_1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c1To2_2 = createConnection([
    ["2024-10-16", "06:00", "city1MainStationId"],
    ["2024-10-16", "07:00", "city2MainStationId"],
  ]);
  const c2To3 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);
  const c1To3 = createConnection([
    ["2024-10-16", "09:00", "city1MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1To2_1, c1To2_2, c2To3, c1To3]);

  // first two conns do the same leg on different days, but only first is used in the journey
  const journeys = new JourneyCollection();
  const j1 = journeys.addJourney({
    "City1->City2": c1To2_1.id,
    "City2->City3": c2To3.id,
  });
  const j2 = journeys.addJourney({ "City1->City3": c1To3.id });
  journeys.setActive(j1);

  // only expect legs for the active journey j1
  const exp = [
    {
      id: c1To2_1.id.toString(),
      displayId: c1To2_1.name,
      type: "train",
      leg: c1To2_1.leg.toString(),
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c1To2_1.start.departure,
      endDateTime: c1To2_1.end.arrival,
      color: getColor(0),
      active: true,
    },
    {
      id: c1To2_2.id.toString(),
      displayId: c1To2_2.name,
      type: "train",
      leg: c1To2_2.leg.toString(),
      startStation: "City 1 Main Station",
      endStation: "City 2 Main Station",
      startDateTime: c1To2_2.start.departure,
      endDateTime: c1To2_2.end.arrival,
      color: getColor(0),
      active: false,
    },
    {
      id: c2To3.id.toString(),
      displayId: c2To3.name,
      type: "train",
      leg: c2To3.leg.toString(),
      startStation: "City 2 Main Station",
      endStation: "City 3 Main Station",
      startDateTime: c2To3.start.departure,
      endDateTime: c2To3.end.arrival,
      color: getColor(1),
      active: true,
    },
  ];

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toStrictEqual(exp);
});
