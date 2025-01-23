/**
 * @jest-environment jsdom
 */

const util = require("./calendarTestUtils");
const { CalendarWrapper } = require("../../script/components/calendar.js");
const { timeout } = require("../calendarTestUtils.js");
const { DateTime } = require("luxon");

const template = `
    <div class="calendar-entry"
         data-departure-datetime=""
         data-arrival-datetime=""
         data-active=""
         data-group=""
         data-color="">

        <div class="header">
            <img class="connection-icon" alt="icon for train/ferry/etc" src=""/>
            <span class="connection-number"></span>
        </div>
        <div class="start">
            <span class="time"></span>
            <span class="station"></span>
        </div>
        <div class="destination">
            <span class="time"></span>
            <span class="station"></span>
        </div>
    </div>`;

beforeEach(() => {
  util.createDocument();

  const templateElement = document.createElement("template");
  templateElement.id = "template-calendar-connection";
  templateElement.innerHTML = template;

  document.body.appendChild(templateElement);
});

test("update should fill in template correctly", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

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

  calendar.updateView(connections);
  await timeout(10);

  const got = util.getShadowDOMItems(container, ".entry-part");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 19 * 4,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
    {
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 10 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
  ]);

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
  expect(gotContents.destinationStation.innerHTML).toBe("Oulu Station");
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

  calendar.updateView(connections);
  await timeout(10);

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
  calendar.updateView(connections);
  await timeout(10);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // they are still relevant
  calendar.updateView(connections);
  await timeout(10);
  expect(startStations()).toEqual(["station1", "station2", "station3"]);

  // now first one is no longer relevant
  calendar.updateView(connections.slice(1, 3));
  await timeout(10);
  expect(startStations()).toEqual(["station2", "station3"]);

  // now first is back but second is gone
  // todo yes indeed that results in a bad time order of connections
  calendar.updateView([connections[0], connections[2]]);
  await timeout(10);
  expect(startStations()).toEqual(["station3", "station1"]);
});

test("update view should propagate selected/active status", async function () {
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
  ];

  function isActive() {
    const entries = util.getShadowDOMItems(container, ".entry-part");
    return entries.data.map((e) => e.isActive);
  }

  calendar.updateView(connections);
  await timeout(10);
  expect(isActive()).toStrictEqual([false, false]);

  connections[1].selected = true;
  calendar.updateView(connections);
  await timeout(10);
  expect(isActive()).toStrictEqual([false, true]);

  connections[0].selected = true;
  connections[1].selected = true;
  calendar.updateView(connections);
  await timeout(10);
  expect(isActive()).toStrictEqual([true, true]);
});

test("calendar wrapper should propagate callbacks from calendar", async function () {
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
  ];

  calendar.updateView(connections);
  await timeout(10);
  const entries = util.getShadowDOMItems(container, ".entry-part");

  const dropCallback = jest.fn();
  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  calendar.on("legChanged", dropCallback);
  calendar.on("entryHoverStart", hoverOnCallback);
  calendar.on("entryHoverStop", hoverOffCallback);

  await util.dispatchEvent(entries.elements[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith(connections[0].uniqueId);

  await util.dispatchEvent(entries.elements[1], "mouseout");
  expect(hoverOffCallback).toBeCalledWith(connections[1].uniqueId);

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

  calendar.updateView(connections);
  await timeout(10);
  const entries = util.getShadowDOMItems(container, ".entry-part");

  calendar.setHoverLeg("leg1");
  expect(entries.all.isHover).toStrictEqual([true, false]);
});
