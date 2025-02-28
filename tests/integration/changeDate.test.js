/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import { testCities, testStations } from "tests/_data.js";
import { initDOMFromFile, DOM, timeout } from "tests/_domUtils.js";
import { main } from "/script/main.js";

import { CalendarWrapper } from "/script/components/calendar.js";
import { Datepicker } from "/script/components/datepicker.js";
import * as util from "../_calendarTestUtils.js";

beforeEach(() => {
  initDOMFromFile("index.html");
});

const c1 = {
  id: "1234",
  type: "train",
  name: "ICE 1234",
  stops: [
    {
      station_id: "city1MainStationId",
      arrival_time: "04:12:00",
      departure_time: "04:12:00",
    },
    {
      station_id: "city2MainStationId",
      arrival_time: "04:49:00",
      departure_time: "04:51:00",
    },
  ],
};

test("changing date in datepicker should change calendar events", async function () {
  const mapCallbacks = {};

  const views = {
    calendar: new CalendarWrapper(DOM.calendar),
    datepicker: new Datepicker(DOM.datePicker),
    map: {
      load: jest.fn(),
      on: (name, fn) => (mapCallbacks[name] = fn),
      updateView: jest.fn(),
    },
    perlschnur: { updateView: jest.fn() },
    layout: { updateView: jest.fn() },
  };

  const data = {
    connections: [c1],
    stations: testStations,
    cities: testCities,
    routes: { "City1->City2": [["City1->City2"]] },
  };

  // set up all the callbacks etc
  await main("City1", views, data);
  DOM.datePicker.setAttribute("date", "2025-10-10");

  // add journey
  mapCallbacks["showCityRoutes"]("City2");
  await timeout(100);

  // change date
  DOM.datePicker.setAttribute("date", "2025-10-07");
  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 4.25 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 4.75 * 4,
      },
    },
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": util.ROW_MIDNIGHT + 4.25 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 4.75 * 4,
      },
    },
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 2,
        "grid-row-start": util.ROW_MIDNIGHT + 4.25 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 4.75 * 4,
      },
    },
  ]);
});
