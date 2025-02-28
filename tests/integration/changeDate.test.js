/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import { DateTime } from "luxon";
import {
  createConnection,
  testCities,
  testStations,
  DAY1,
  DAY2,
  DAY2T,
  DAY3T,
  DAY4T,
} from "tests/_data.js";
import { initDOMFromFile, timeout } from "tests/_domUtils.js";
import { main } from "/script/main.js";

beforeEach(() => {
  initDOMFromFile("index.html");
});

async function initWithMockViews(home, data) {
  const callbacks = { map: {}, calendar: {}, datePicker: {} };

  const views = {
    calendar: {
      on: (name, fn) => (callbacks.calendar[name] = fn),
      updateView: jest.fn(),
    },
    datepicker: {
      on: (name, fn) => (callbacks.datePicker[name] = fn),
      currentDate: DateTime.fromISO(DAY1),
    },
    map: {
      load: jest.fn(),
      on: (name, fn) => (callbacks.map[name] = fn),
      updateView: jest.fn(),
    },
    perlschnur: { updateView: jest.fn() },
    layout: { updateView: jest.fn() },
  };

  // set up all the callbacks etc
  await main(home, views, data);
  return [views, callbacks];
}

test("changing date in datepicker should change calendar events", async function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-15", "09:00", "city2MainStationId"],
  ]);

  const data = {
    connections: [c1],
    stations: testStations,
    cities: testCities,
    routes: { "City1->City2": [["City1->City2"]] },
  };
  const [views, userActions] = await initWithMockViews("City1", data);

  // add journey
  userActions.map["showCityRoutes"]("City2");
  await timeout(100);

  // change date
  // todo this generates a connection for each calendar date -> 3 connections instead of one
  userActions.datePicker["dateChanged"](DateTime.fromISO(DAY2));
  expect(views.calendar.updateView).toHaveBeenLastCalledWith({
    startDate: DAY2,
    connections: [
      expect.objectContaining({
        startDateTime: DateTime.fromISO(DAY2T("08:00")),
      }),
      expect.objectContaining({
        startDateTime: DateTime.fromISO(DAY3T("08:00")),
      }),
      expect.objectContaining({
        startDateTime: DateTime.fromISO(DAY4T("08:00")),
      }),
    ],
  });
});
