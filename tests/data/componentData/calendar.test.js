import { DateTime } from "luxon";
import { createConnection } from "tests/data.js";

import { Journey, JourneyCollection } from "/script/data/types/journey.js";
import { Database } from "/script/data/database.js";
import { prepareDataForCalendar } from "/script/data/componentData.js";
import { getColor } from "/script/util.js";

function expected(connection, selected, color) {
  return {
    uniqueId: connection.uniqueId,
    leg: `${connection.startCityName}->${connection.endCityName}`,
    name: connection.name,
    type: connection.type,
    startStation: connection.startStationName,
    startDateTime: connection.departure,
    endStation: connection.endStationName,
    endDateTime: connection.arrival,
    selected: selected,
    color: color,
  };
}

test("prepareDataForCalendarEmpty", function () {
  const calendarStartDate = DateTime.fromISO("2024-10-15");

  const database = new Database([]);

  const journeys = new JourneyCollection();

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got).toStrictEqual({ startDate: "2024-10-15", connections: [] });
});

test("prepareDataForCalendarNoActiveJourney", function () {
  const calendarStartDate = DateTime.fromISO("2024-10-15");

  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney([c1.id]);

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got).toStrictEqual({ startDate: "2024-10-15", connections: [] });
});

test("prepareDataForCalendarSingleJourneyNoAlternatives", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const calendarStartDate = DateTime.fromISO("2024-10-15");

  const j1 = new Journey([c1.uniqueId]);
  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const c1_day0 = c1.changeDate(DateTime.fromISO("2024-10-15"));
  const c1_day1 = c1.changeDate(DateTime.fromISO("2024-10-16"));
  const c1_day2 = c1.changeDate(DateTime.fromISO("2024-10-17"));

  const exp = [
    expected(c1_day0, true, getColor(0)),
    expected(c1_day1, false, getColor(0)),
    expected(c1_day2, false, getColor(0)),
  ];

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got.connections).toEqual(exp);
});

test("prepareDataForCalendarSingleJourneyNoAlternativesDifferentStartDate", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const calendarStartDate = DateTime.fromISO("2024-10-13");

  const j1 = new Journey([c1.uniqueId]);
  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const c1_day0 = c1.changeDate(DateTime.fromISO("2024-10-13"));
  const c1_day1 = c1.changeDate(DateTime.fromISO("2024-10-14"));
  const c1_day2 = c1.changeDate(DateTime.fromISO("2024-10-15"));

  const exp = [
    expected(c1_day0, false, getColor(0)),
    expected(c1_day1, false, getColor(0)),
    expected(c1_day2, true, getColor(0)),
  ];

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got.connections).toEqual(exp);
});

test("prepareDataForCalendarSingleJourneyAfterShift", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const calendarStartDate = DateTime.fromISO("2024-10-16");

  const j1 = new Journey([c1.uniqueId]);
  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  journeys.shiftDate(1, database);

  const c1_day0 = c1.changeDate(DateTime.fromISO("2024-10-16"));
  const c1_day1 = c1.changeDate(DateTime.fromISO("2024-10-17"));
  const c1_day2 = c1.changeDate(DateTime.fromISO("2024-10-18"));

  const exp = [
    expected(c1_day0, true, getColor(0)),
    expected(c1_day1, false, getColor(0)),
    expected(c1_day2, false, getColor(0)),
  ];

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got.connections).toEqual(exp);
});

test("prepareDataForCalendarTwoJourneysNoAlternatives", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const calendarStartDate = DateTime.fromISO("2024-10-15");

  const j1 = new Journey([c1.uniqueId]); // irrelevant because not active
  const j2 = new Journey([c2.uniqueId]);
  const database = new Database([c1, c2]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.addJourney(j2);
  journeys.setActive(j2.id);

  const c2_day0 = c2.changeDate(DateTime.fromISO("2024-10-15"));
  const c2_day1 = c2.changeDate(DateTime.fromISO("2024-10-16"));
  const c2_day2 = c2.changeDate(DateTime.fromISO("2024-10-17"));

  const exp = [
    expected(c2_day0, true, getColor(0)),
    expected(c2_day1, false, getColor(0)),
    expected(c2_day2, false, getColor(0)),
  ];

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got.connections).toEqual(exp);
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

  const calendarStartDate = DateTime.fromISO("2024-10-15");

  const j1 = new Journey([c1.uniqueId, c2.uniqueId]);
  const database = new Database([c1, c2, c2_alt]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const c1_day0 = c1.changeDate(DateTime.fromISO("2024-10-15"));
  const c1_day1 = c1.changeDate(DateTime.fromISO("2024-10-16"));
  const c1_day2 = c1.changeDate(DateTime.fromISO("2024-10-17"));

  const c2_day0 = c2.changeDate(DateTime.fromISO("2024-10-15"));
  const c2_day1 = c2.changeDate(DateTime.fromISO("2024-10-16"));
  const c2_day2 = c2.changeDate(DateTime.fromISO("2024-10-17"));

  const c2_alt_day0 = c2_alt.changeDate(DateTime.fromISO("2024-10-15"));
  const c2_alt_day1 = c2_alt.changeDate(DateTime.fromISO("2024-10-16"));
  const c2_alt_day2 = c2_alt.changeDate(DateTime.fromISO("2024-10-17"));

  // not sorting this for simplicity
  // if implementation changes, test might fail
  const exp = [
    expected(c1_day0, true, getColor(0)),
    expected(c1_day1, false, getColor(0)),
    expected(c1_day2, false, getColor(0)),

    expected(c2_day0, false, getColor(1)),
    expected(c2_day1, true, getColor(1)),
    expected(c2_day2, false, getColor(1)),
    expected(c2_alt_day0, false, getColor(1)),
    expected(c2_alt_day1, false, getColor(1)),
    expected(c2_alt_day2, false, getColor(1)),
  ];

  const got = prepareDataForCalendar(calendarStartDate, journeys, database);
  expect(got.connections).toEqual(exp);
});
