/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import { DateTime } from "luxon";
import { CalendarWrapper } from "/script/components/calendar.js";
import { initDOMFromFile, DOM } from "tests/domUtils.js";
import * as util from "tests/calendarTestUtils.js";

beforeEach(() => {
  initDOMFromFile("index.html");
});

expect.extend({
  customMatches(expected, actual) {
    function toObject(a) {
      for (let selector in expected[0].selectors) {
        console.log(a.querySelector(selector));
      }
    }

    toObject(actual[0]);
    return true;
  },
});

test("update should fill in template correctly", async function () {
  const calendar = new CalendarWrapper(DOM.calendar);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      leg: "Berlin->Oulu",
      name: "nachtzug 123",
      type: "train",
      startStation: "Berlin Gesundbrunnen",
      startDateTime: DateTime.fromISO(util.t1("19:00")),
      endStation: "Oulu Station",
      endDateTime: DateTime.fromISO(util.t3("10:00")), // 3-day connection
      selected: true,
      color: "purple",
    },
  ];

  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);

  const got = DOM.calendarEvents.asObjects();
  expect(got).toMatchObject([
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 19 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
      },
    },
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
      },
    },
    {
      dataset: { group: "Berlin->Oulu", status: "active" },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 2,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 10 * 4,
      },
    },
  ]);

  const got2 = DOM.calendarEvents;
  expect(got2).customMatches([{ selectors: { ".connection-number": "123" } }]);

  /*
  const gotContents = {
    // header and start info in first part
    connectionIcon: got.elements[0].querySelector(".connection-icon"),
    connectionNumber: got.elements[0].querySelector(".connection-number"),
    startTime: got.elements[0].querySelector(".start .time"),
    startStation: got.elements[0].querySelector(".start .station"),
    // destination info in last part
    destinationTime: got.elements[2].querySelector(".destination .time"),
    destinationStation: got.elements[2].querySelector(".destination .station"),
  };

  expect(gotContents.connectionIcon.src).toContain("train.svg");
  expect(gotContents.connectionNumber.innerHTML).toBe("nachtzug 123");
  expect(gotContents.startTime.innerHTML).toBe("19:00");
  expect(gotContents.startStation.innerHTML).toBe("Berlin Gesundbrunnen");
  expect(gotContents.destinationTime.innerHTML).toBe("10:00");
  expect(gotContents.destinationStation.innerHTML).toBe("Oulu Station");*/
});

test("update view should sort connections by start datetime", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      startDateTime: DateTime.fromISO(util.t2("19:00")),
      endDateTime: DateTime.fromISO(util.t2("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      startDateTime: DateTime.fromISO(util.t1("09:00")),
      endDateTime: DateTime.fromISO(util.t1("10:00")),
    },
    {
      uniqueId: { id: 3, somekey: "someval" },
      startStation: "station3",
      startDateTime: DateTime.fromISO(util.t1("14:00")),
      endDateTime: DateTime.fromISO(util.t1("15:00")),
    },
  ];

  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);

  const got = util.getShadowDOMItems(container, ".entry-part");
  expect(got.elements.length).toBe(3);
  expect(got.elements[0].innerHTML).toContain("station2");
  expect(got.elements[1].innerHTML).toContain("station3");
  expect(got.elements[2].innerHTML).toContain("station1");
});

test("update view should add/delete connections as necessary", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      startDateTime: DateTime.fromISO(util.t1("19:00")),
      endDateTime: DateTime.fromISO(util.t1("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      startDateTime: DateTime.fromISO(util.t2("09:00")),
      endDateTime: DateTime.fromISO(util.t2("10:00")),
    },
    {
      uniqueId: { id: 3, somekey: "someval" },
      startStation: "station3",
      startDateTime: DateTime.fromISO(util.t3("14:00")),
      endDateTime: DateTime.fromISO(util.t3("15:00")),
    },
  ];

  function startStations() {
    const entries = util.getShadowDOMItems(container, ".entry-part");
    return entries.elements.map(
      (e) => e.querySelector(".start .station").innerHTML,
    );
  }

  // all 3 connections currently relevant
  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // they are still relevant
  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // now first one is no longer relevant
  calendar.updateView({
    startDate: util.DATES[0],
    connections: connections.slice(1, 3),
  });
  await util.timeout(10);
  expect(startStations()).toEqual(["station2", "station3"]);

  // now first is back but second is gone
  // todo yes indeed that results in a bad time order of connections
  // todo if it happens to be in good time order, i.e. this test fails,
  //  then "station3" entry was identified as changed and removed and re-added
  // which means that this will happen to all the entries which means bad performance
  calendar.updateView({
    startDate: util.DATES[0],
    connections: [connections[0], connections[2]],
  });
  await util.timeout(10);
  expect(startStations()).toEqual(["station3", "station1"]);
});

test("update view should propagate dataset changes to calendar entries", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      color: "purple",
      leg: "leg1",
      startDateTime: DateTime.fromISO(util.t1("19:00")),
      endDateTime: DateTime.fromISO(util.t1("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      color: "orange",
      leg: "leg2",
      startDateTime: DateTime.fromISO(util.t2("09:00")),
      endDateTime: DateTime.fromISO(util.t2("10:00")),
    },
  ];

  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);

  let got = util.getShadowDOMItems(container, ".entry-part");
  expect(got.data).toMatchObject([
    {
      color: "purple",
      group: "leg1",
      isActive: false,
    },
    {
      color: "orange",
      group: "leg2",
      isActive: false,
    },
  ]);

  connections[0].color = "black";
  connections[1].leg = "legZ";
  connections[1].selected = true;
  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);

  got = util.getShadowDOMItems(container, ".entry-part");
  expect(got.data).toMatchObject([
    {
      color: "black",
      group: "leg1",
      isActive: false,
    },
    {
      color: "orange",
      group: "legZ",
      isActive: true,
    },
  ]);
});

test("calendar wrapper should propagate callbacks from calendar", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      leg: "leg1",
      startDateTime: DateTime.fromISO(util.t1("19:00")),
      endDateTime: DateTime.fromISO(util.t1("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      leg: "leg2",
      startDateTime: DateTime.fromISO(util.t2("09:00")),
      endDateTime: DateTime.fromISO(util.t2("10:00")),
    },
  ];

  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);
  const entries = util.getShadowDOMItems(container, ".entry-part");

  const dropCallback = jest.fn();
  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  calendar.on("legChanged", dropCallback);
  calendar.on("legHoverStart", hoverOnCallback);
  calendar.on("legHoverStop", hoverOffCallback);

  await util.dispatchEvent(entries.elements[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith("leg1");

  await util.dispatchEvent(entries.elements[1], "mouseout");
  expect(hoverOffCallback).toBeCalledWith("leg2");

  await util.dispatchEvent(entries.elements[0], "dragstart");
  await util.dispatchEvent(entries.elements[0], "dragenter");
  await util.dispatchEvent(entries.elements[0], "drop");
  expect(dropCallback).toBeCalledWith(connections[0].uniqueId);
});

test("calendar wrapper should propagate commands into calendar", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const connections = [
    {
      uniqueId: { id: 1, somekey: "someval" },
      startStation: "station1",
      leg: "leg1",
      startDateTime: DateTime.fromISO(util.t1("19:00")),
      endDateTime: DateTime.fromISO(util.t1("20:00")),
    },
    {
      uniqueId: { id: 2, somekey: "someval" },
      startStation: "station2",
      leg: "leg2",
      startDateTime: DateTime.fromISO(util.t2("09:00")),
      endDateTime: DateTime.fromISO(util.t2("10:00")),
    },
  ];

  calendar.updateView({ startDate: util.DATES[0], connections: connections });
  await util.timeout(10);
  const entries = util.getShadowDOMItems(container, ".entry-part");

  calendar.setHoverLeg("leg1");
  expect(entries.all.isHover).toStrictEqual([true, false]);
});
