const {
  prepareDataForCalendar,
  getColor,
} = require("../../script/components/componentData.js");
const { Journey, JourneyCollection } = require("../../script/types/journey.js");
const { Database } = require("../../script/database.js");
const { createConnection } = require("../../tests/data.js");

function expectedOption(connection, selected) {
  return {
    id: connection.id,
    name: connection.name,
    type: connection.type,
    date: connection.date,
    startStation: connection.stops[0].stationName,
    startDateTime: connection.stops[0].departure,
    endStation: connection.stops.at(-1).stationName,
    endDateTime: connection.stops.at(-1).arrival,
    selected: selected,
  };
}

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
  journeys.addJourney([c1.id]);

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toStrictEqual([]);
});

test("prepareDataForCalendarSingleJourneyNoAlternatives", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId]);
  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const c1_day0 = c1;
  const c1_day1 = c1.changeDate(new Date("2024-10-16"));
  const c1_day2 = c1.changeDate(new Date("2024-10-17"));

  const exp = [
    {
      startCityName: "City1",
      endCityName: "City2",
      color: getColor(0),
      options: [
        expectedOption(c1_day0, true),
        expectedOption(c1_day1, false),
        expectedOption(c1_day2, false),
      ],
    },
  ];

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toEqual(exp);
});

test("prepareDataForCalendarTwoJourneysNoAlternatives", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "06:00", "city2MainStationId"],
    ["2024-10-16", "07:00", "city3MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId]); // irrelevant because not active
  const j2 = new Journey([c2.uniqueId]);
  const database = new Database([c1, c2]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.addJourney(j2);
  journeys.setActive(j2.id);

  const c2_day0 = c2;
  const c2_day1 = c2.changeDate(new Date("2024-10-17"));
  const c2_day2 = c2.changeDate(new Date("2024-10-18"));

  const exp = [
    {
      startCityName: "City2",
      endCityName: "City3",
      color: getColor(0),
      options: [
        expectedOption(c2_day0, true),
        expectedOption(c2_day1, false),
        expectedOption(c2_day2, false),
      ],
    },
  ];

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toEqual(exp);
});

test("prepareDataForCalendarSingleJourneyMultipleConnectionsWithAlternatives", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "06:00", "city2MainStationId"],
    ["2024-10-16", "07:00", "city3MainStationId"],
  ]);
  const c2_alt = createConnection([
    ["2024-10-17", "08:00", "city2MainStationId"],
    ["2024-10-17", "09:00", "city3ExtraStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId, c2.uniqueId]);
  const database = new Database([c1, c2, c2_alt]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const c1_day0 = c1;
  const c1_day1 = c1.changeDate(new Date("2024-10-16"));
  const c1_day2 = c1.changeDate(new Date("2024-10-17"));

  const c2_day0 = c2.changeDate(new Date("2024-10-15"));
  const c2_day1 = c2;
  const c2_day2 = c2.changeDate(new Date("2024-10-17"));

  const c2_alt_day0 = c2_alt.changeDate(new Date("2024-10-15"));
  const c2_alt_day1 = c2_alt.changeDate(new Date("2024-10-16"));
  const c2_alt_day2 = c2_alt;

  const exp = [
    {
      startCityName: "City1",
      endCityName: "City2",
      color: getColor(0),
      options: [
        expectedOption(c1_day0, true),
        expectedOption(c1_day1, false),
        expectedOption(c1_day2, false),
      ],
    },
    {
      startCityName: "City2",
      endCityName: "City3",
      color: getColor(1),
      options: [
        // not sorting this for simplicity
        // if implementation changes, test might fail
        expectedOption(c2_day0, false),
        expectedOption(c2_day1, true),
        expectedOption(c2_day2, false),
        expectedOption(c2_alt_day0, false),
        expectedOption(c2_alt_day1, false),
        expectedOption(c2_alt_day2, false),
      ],
    },
  ];

  const got = prepareDataForCalendar(journeys, database);
  expect(got).toEqual(exp);
});
