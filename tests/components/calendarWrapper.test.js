/**
 * @jest-environment jsdom
 */

import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");
import { jest } from "@jest/globals";
import { DateTime } from "luxon";
import { CalendarWrapper } from "/script/components/calendar.js";
import {
  dispatchEvent,
  DOM,
  initDOMFromFile,
  timeout,
} from "tests/_domUtils.js";
import { CALENDAR_GRID, DAY1, DAY1T, DAY2T, DAY3T } from "tests/_data.js";

beforeEach(() => {
  initDOMFromFile("planner.html");
});

async function updateCalendar(calendar, conns) {
  calendar.updateView({ startDate: DAY1, connections: conns });
  await timeout(10);
}

test("update should fill in template correctly", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      leg: "Berlin->Oulu",
      name: "nachtzug 123",
      type: "train",
      startStation: "Berlin Gesundbrunnen",
      startDateTime: DateTime.fromISO(DAY1T("19:00")),
      endStation: "Oulu Station",
      endDateTime: DateTime.fromISO(DAY3T("10:00")), // 3-day connection
      selected: true,
      color: "purple",
    },
  ];

  await updateCalendar(calendar, connections);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 19 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
      },
      selectors: {
        ".connection-icon": { src: expect.stringMatching("train.svg") },
        ".connection-number": { innerHTML: "nachtzug 123" },
        ".start .time": { innerHTML: "19:00" },
        ".start .station": { innerHTML: "Berlin Gesundbrunnen" },
      },
    },
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
      },
    },
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 10 * 4,
      },
      selectors: {
        ".destination .time": { innerHTML: "10:00" },
        ".destination .station": { innerHTML: "Oulu Station" },
      },
    },
  ]);
});

test("update view should sort connections by start datetime", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      startDateTime: DateTime.fromISO(DAY2T("19:00")),
      endDateTime: DateTime.fromISO(DAY2T("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      startDateTime: DateTime.fromISO(DAY1T("09:00")),
      endDateTime: DateTime.fromISO(DAY1T("10:00")),
    },
    {
      uniqueId: { id: 3, somekey: "someval" },
      startStation: "station3",
      startDateTime: DateTime.fromISO(DAY1T("14:00")),
      endDateTime: DateTime.fromISO(DAY1T("15:00")),
    },
  ];

  await updateCalendar(calendar, connections);
  expect(DOM.calendarEntryParts).toMatchDOMObject([
    { innerHTML: expect.stringMatching("station2") },
    { innerHTML: expect.stringMatching("station3") },
    { innerHTML: expect.stringMatching("station1") },
  ]);
});

test("update view should add/delete connections as necessary", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      startDateTime: DateTime.fromISO(DAY1T("19:00")),
      endDateTime: DateTime.fromISO(DAY1T("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      startDateTime: DateTime.fromISO(DAY2T("09:00")),
      endDateTime: DateTime.fromISO(DAY2T("10:00")),
    },
    {
      uniqueId: { id: 3, somekey: "someval" },
      startStation: "station3",
      startDateTime: DateTime.fromISO(DAY3T("14:00")),
      endDateTime: DateTime.fromISO(DAY3T("15:00")),
    },
  ];

  const startStations = () =>
    DOM.calendarEntryParts.map(
      (e) => e.querySelector(".start .station").innerHTML,
    );

  // all 3 connections currently relevant
  await updateCalendar(calendar, connections);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // they are still relevant
  await updateCalendar(calendar, connections);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // now first one is no longer relevant
  await updateCalendar(calendar, connections.slice(1, 3));
  expect(startStations()).toEqual(["station2", "station3"]);

  // now first is back but second is gone
  // todo yes indeed that results in a bad time order of connections
  // todo if it happens to be in good time order, i.e. this test fails,
  //  then "station3" entry was identified as changed and removed and re-added
  // which means that this will happen to all the entries which means bad performance
  await updateCalendar(calendar, [connections[0], connections[2]]);
  expect(startStations()).toEqual(["station3", "station1"]);
});

test("update view should propagate dataset changes to calendar entries", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      color: "purple",
      leg: "leg1",
      startDateTime: DateTime.fromISO(DAY1T("19:00")),
      endDateTime: DateTime.fromISO(DAY1T("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      color: "orange",
      leg: "leg2",
      startDateTime: DateTime.fromISO(DAY2T("09:00")),
      endDateTime: DateTime.fromISO(DAY2T("10:00")),
    },
  ];

  await updateCalendar(calendar, connections);
  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: { "--color": "purple" },
      dataset: { group: "leg1", status: "inactive" },
    },
    {
      style: { "--color": "orange" },
      dataset: { group: "leg2", status: "inactive" },
    },
  ]);

  connections[0].color = "black";
  connections[1].leg = "legZ";
  connections[1].selected = true;

  await updateCalendar(calendar, connections);
  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: { "--color": "black" },
      dataset: { group: "leg1", status: "inactive" },
    },
    {
      style: { "--color": "orange" },
      dataset: { group: "legZ", status: "active" },
    },
  ]);
});

test("calendar wrapper should propagate callbacks/commands from/to calendar", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      leg: "leg1",
      startDateTime: DateTime.fromISO(DAY1T("19:00")),
      endDateTime: DateTime.fromISO(DAY1T("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      leg: "leg2",
      startDateTime: DateTime.fromISO(DAY2T("09:00")),
      endDateTime: DateTime.fromISO(DAY2T("10:00")),
    },
  ];

  // add the entries to the calendar
  await updateCalendar(calendar, connections);

  // setup callback mocks
  const dropCallback = jest.fn();
  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  calendar.on("legChanged", dropCallback);
  calendar.on("legHoverStart", hoverOnCallback);
  calendar.on("legHoverStop", hoverOffCallback);

  // run a bunch of callbacks on the calendar entries
  // -> these should be propagated to calendar wrapper and our callback mocks should be called
  await dispatchEvent(DOM.calendarEntryParts[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith("leg1");

  await dispatchEvent(DOM.calendarEntryParts[1], "mouseout");
  expect(hoverOffCallback).toBeCalledWith("leg2");

  await dispatchEvent(DOM.calendarEntryParts[0], "dragstart");
  await dispatchEvent(DOM.calendarEntryParts[0], "dragenter");
  await dispatchEvent(DOM.calendarEntryParts[0], "drop");
  expect(dropCallback).toBeCalledWith(connections[0].uniqueId);

  // when sending a command to calendar wrapper it should be propagated to the calendar
  calendar.setHoverLeg("leg1");
  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      class: expect.stringMatching("hover"),
    },
    {
      class: expect.not.stringMatching("hover"),
    },
  ]);
});
