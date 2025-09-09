/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";

import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

import { CalendarWrapper } from "script/components/calendar.js";
import {
  dispatchTestEvent,
  initTestDOM,
  TEST_DOM,
  timeout,
} from "tests/_helpers/domUtils.js";
import {
  connectionFromShorthand as _c,
  getTestColor as _color,
  DAY1,
} from "tests/_helpers/data.js";
import { prepareDataForCalendar } from "../../script/data/components/calendar.js";
import { Itinerary } from "../../script/types/itinerary.js";

beforeEach(async () => {
  initTestDOM();
});

// these tests are mostly here to make sure that the data from the prepareDataForXXX methods
// is properly used to fill in the templates
// -> instead of directly creating the data, we are letting prepareDataForXXX prepare it
async function updateCalendar(calendar, activeConnections, alternatives) {
  const itinerary = new Itinerary(activeConnections);
  const data = prepareDataForCalendar(itinerary, alternatives);

  calendar.updateView(DAY1, data);
  await timeout(10);
}

const connectionNumbers = () =>
  TEST_DOM.calendarEntries.map(
    (e) => e.querySelector(".connection-number").innerHTML,
  );

test("update view should fill in template correctly", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c1_alt1 = _c("T2: S1@D2T10->S2@D2T11");
  const c1_alt2 = _c("T3: S1@D3T10->S2@D3T11");
  const c2 = _c("T4: S2@D3T14->S3@D3T15");

  const active = [c1, c2];
  const alternatives = [[c1_alt1, c1_alt2], []]; // no alternatives for c2

  const calendar = new CalendarWrapper(TEST_DOM.calendar);
  await updateCalendar(calendar, active, alternatives);

  // todo how does day fit into here
  expect(TEST_DOM.calendarEntries.length).toBe(4);
  expect(TEST_DOM.calendarEntries[0]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      active: "active",
      color: _color(0),
      departureDatetime: c1.from.departure.toISO(),
      arrivalDatetime: c1.to.arrival.toISO(),
    },
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerHTML: "T1" },
      ".start .time": { innerHTML: "10:00" },
      ".start .station": { innerHTML: "S1" },
      ".destination .time": { innerHTML: "11:00" },
      ".destination .station": { innerHTML: "S2" },
    },
  });
  expect(TEST_DOM.calendarEntries[1]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      active: "",
      color: _color(0),
      departureDatetime: c1_alt1.from.departure.toISO(),
      arrivalDatetime: c1_alt1.to.arrival.toISO(),
    },
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerHTML: "T2" },
      ".start .time": { innerHTML: "10:00" },
      ".start .station": { innerHTML: "S1" },
      ".destination .time": { innerHTML: "11:00" },
      ".destination .station": { innerHTML: "S2" },
    },
  });
  expect(TEST_DOM.calendarEntries[2]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      active: "",
      color: _color(0),
      departureDatetime: c1_alt2.from.departure.toISO(),
      arrivalDatetime: c1_alt2.to.arrival.toISO(),
    },
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerHTML: "T3" },
      ".start .time": { innerHTML: "10:00" },
      ".start .station": { innerHTML: "S1" },
      ".destination .time": { innerHTML: "11:00" },
      ".destination .station": { innerHTML: "S2" },
    },
  });
  expect(TEST_DOM.calendarEntries[3]).toMatchDOMObject({
    dataset: {
      group: "S2->S3",
      active: "active",
      color: _color(1),
      departureDatetime: c2.from.departure.toISO(),
      arrivalDatetime: c2.to.arrival.toISO(),
    },
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerHTML: "T4" },
      ".start .time": { innerHTML: "14:00" },
      ".start .station": { innerHTML: "S2" },
      ".destination .time": { innerHTML: "15:00" },
      ".destination .station": { innerHTML: "S3" },
    },
  });
});

test("update view should sort connections by start datetime", async function () {
  const c1 = _c("T1: S1@D2T10->S2@D2T11");
  const c1_alt1 = _c("T2: S1@D1T07->S2@D1T08");
  const c1_alt2 = _c("T3: S1@D1T10->S2@D1T11");
  const c2 = _c("T4: S2@D3T14->S3@D3T15");

  const active = [c1, c2];
  const alternatives = [[c1_alt1, c1_alt2], []];

  const calendar = new CalendarWrapper(TEST_DOM.calendar);
  await updateCalendar(calendar, active, alternatives);

  expect(connectionNumbers()).toMatchObject(["T2", "T3", "T1", "T4"]);
});

test("update view should add/delete connections as necessary", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c1_alt1 = _c("T2: S1@D2T10->S2@D2T11");
  const c1_alt2 = _c("T3: S1@D3T10->S2@D3T11");
  const c2 = _c("T4: S2@D3T14->S3@D3T15");

  const active = [c1, c2];
  const alternatives = [[c1_alt1, c1_alt2], [c2]];

  const calendar = new CalendarWrapper(TEST_DOM.calendar);

  // all connections currently relevant
  await updateCalendar(calendar, active, alternatives);
  expect(connectionNumbers()).toMatchObject(["T1", "T2", "T3", "T4"]);

  // they are still relevant
  await updateCalendar(calendar, active, alternatives);
  expect(connectionNumbers()).toMatchObject(["T1", "T2", "T3", "T4"]);

  // removing the alternatives
  await updateCalendar(calendar, active, [[], []]);
  expect(connectionNumbers()).toMatchObject(["T1", "T4"]);

  // now alternatives are back
  // todo yes indeed that results in a bad time order of connections
  // todo if it happens to be in good time order, i.e. this test fails,
  //  then "station3" entry was identified as changed and removed and re-added
  // which means that this will happen to all the entries which means bad performance
  // todo but they need to be in right time order for drag and drop to work
  await updateCalendar(calendar, active, alternatives);
  expect(connectionNumbers()).toMatchObject(["T1", "T4", "T2", "T3"]);
});

test("update view should propagate connection changes to calendar entries", async function () {
  // manually setting connection data for better control of dataset
  const connections = [
    {
      uniqueId: "1",
      color: "purple",
      leg: "leg1",
      startDateTime: DAY1.plus({ days: 0, hours: 9 }),
      endDateTime: DAY1.plus({ days: 0, hours: 20 }),
    },
    {
      uniqueId: "2",
      color: "orange",
      leg: "leg2",
      startDateTime: DAY1.plus({ days: 1, hours: 9 }),
      endDateTime: DAY1.plus({ days: 1, hours: 20 }),
    },
  ];

  const calendar = new CalendarWrapper(TEST_DOM.calendar);
  calendar.updateView(DAY1, connections);
  await timeout(10);

  expect(TEST_DOM.calendarEntries[0]).toMatchDOMObject({
    dataset: { group: "leg1", active: "", color: "purple" },
  });
  expect(TEST_DOM.calendarEntries[1]).toMatchDOMObject({
    dataset: { group: "leg2", active: "", color: "orange" },
  });

  connections[0].color = "black";
  connections[1].leg = "legZ";
  connections[1].selected = true;
  calendar.updateView(DAY1, connections);
  await timeout(10);

  expect(TEST_DOM.calendarEntries[0]).toMatchDOMObject({
    dataset: { group: "leg1", active: "", color: "black" },
  });
  expect(TEST_DOM.calendarEntries[1]).toMatchDOMObject({
    dataset: { group: "legZ", active: "active", color: "orange" },
  });
});

test("calendar wrapper should propagate callbacks/commands from/to calendar", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c1_alt1 = _c("T2: S1@D2T10->S2@D2T11");
  const c1_alt2 = _c("T3: S1@D3T10->S2@D3T11");
  const c2 = _c("T4: S2@D3T14->S3@D3T15");

  const active = [c1, c2];
  const alternatives = [[c1_alt1, c1_alt2], [c2]];

  const calendar = new CalendarWrapper(TEST_DOM.calendar);
  await updateCalendar(calendar, active, alternatives);

  // setup callback mocks
  const dropCallback = jest.fn();
  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  calendar.on("legChanged", dropCallback);
  calendar.on("legHoverStart", hoverOnCallback);
  calendar.on("legHoverStop", hoverOffCallback);

  // run a bunch of callbacks on the calendar entries
  // -> these should be propagated to calendar wrapper and our callback mocks should be called
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith("S1->S2");

  await dispatchTestEvent(TEST_DOM.calendarEntryParts[1], "mouseout");
  expect(hoverOffCallback).toBeCalledWith("S1->S2");

  await dispatchTestEvent(TEST_DOM.calendarEntryParts[3], "mouseout");
  expect(hoverOffCallback).toBeCalledWith("S2->S3");

  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "dragstart");
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[1], "dragenter");
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[1], "drop");
  expect(dropCallback).toBeCalledWith(c1_alt1.id);

  // when sending a command to calendar wrapper it should be propagated to the calendar
  calendar.setHoverLeg("S1->S2");
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    class: expect.stringMatching("hover"),
  });
  expect(TEST_DOM.calendarEntryParts[1]).toMatchDOMObject({
    class: expect.stringMatching("hover"),
  });
  expect(TEST_DOM.calendarEntryParts[2]).toMatchDOMObject({
    class: expect.stringMatching("hover"),
  });
  expect(TEST_DOM.calendarEntryParts[3]).toMatchDOMObject({
    class: expect.not.stringMatching("hover"),
  });
});
