/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

import {
  dispatchEvent,
  DOM,
  initDOMFromFile,
  timeout,
} from "tests/_domUtils.js";
import {
  connectionToCalendarEntry,
  createConnection,
  DAY1,
  DAY2,
  DAY3,
} from "tests/_data.js";

beforeEach(async () => {
  initDOMFromFile("planner.html");
  await DOM.calendar.setAttribute("start-date", DAY1);
});

async function addEntryToCalendar(connection, kwargs) {
  const entry = connectionToCalendarEntry(createConnection(connection), kwargs);
  await DOM.calendar.appendChild(entry);
  return entry;
}

const isHover = () =>
  DOM.calendarEntryParts.map((e) => e.classList.contains("hover"));

const status = () =>
  DOM.calendarEntryParts.map((e) => {
    switch (e.dataset.status) {
      case "active":
        return "act";
      case "inactive":
        return "inact";
      default:
        throw new Error();
    }
  });

const drag = () =>
  DOM.calendarEntryParts.map((e) => {
    switch (e.dataset.dragStatus) {
      case undefined:
        return "undef";
      case "indicator":
        return "ind";
      case "preview":
        return "prev";
      default:
        throw new Error();
    }
  });

test("when hovering over a part of multiparty entry, then all parts should hover", async function () {
  await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ]);

  // by default no part should hover
  expect(isHover()).toStrictEqual([false, false, false]);

  // after mouseover all parts should hover
  await dispatchEvent(DOM.calendarEntryParts[0], "mouseover");
  expect(isHover()).toStrictEqual([true, true, true]);

  // after mouseout no parts should hover
  await dispatchEvent(DOM.calendarEntryParts[2], "mouseout");
  expect(isHover()).toStrictEqual([false, false, false]);
});

test("hover on/off callback should be called when hovering over entry", async function () {
  const entry = await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ]);

  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  DOM.calendar.on("hoverOn", hoverOnCallback);
  DOM.calendar.on("hoverOff", hoverOffCallback);

  // send mouseover on first part of entry
  await dispatchEvent(DOM.calendarEntryParts[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith(entry);

  // send mouseout on third part of entry
  await dispatchEvent(DOM.calendarEntryParts[2], "mouseout");
  expect(hoverOffCallback).toBeCalledWith(entry);
});

test("drag and drop of multi-part entries", async function () {
  const c1 = [
    [DAY1, "16:29", "city1MainStationId"],
    [DAY2, "18:04", "city2MainStationId"],
  ];
  const c2 = [
    [DAY2, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ];
  const c3 = [
    [DAY3, "16:29", "city2MainStationId"],
    [DAY3, "18:04", "city3MainStationId"],
  ];

  // City1 (day1)->City2 (day2)
  await addEntryToCalendar(c1, { active: "active" });
  // City1 (day2)->City2 (day3)
  await addEntryToCalendar(c2, { active: "" });
  // City1 (day2)->City2 (day3)
  await addEntryToCalendar(c3, { active: "active" });

  // this makes it easier to send events (and understand from which calendar entry event was sent)
  const elements = {
    e1: { part1: DOM.calendarEntryParts[0], part2: DOM.calendarEntryParts[1] },
    e2: { part1: DOM.calendarEntryParts[2], part2: DOM.calendarEntryParts[3] },
    e3: { part1: DOM.calendarEntryParts[4] },
  };

  // initial values
  expect(status()).toStrictEqual(["act", "act", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["undef", "undef", "undef", "undef", "undef"]);

  /// when starting dragging e1, it should turn inactive and preview and e2 should be indicator
  await dispatchEvent(elements.e1.part1, "dragstart");
  expect(status()).toStrictEqual(["inact", "inact", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["prev", "prev", "ind", "ind", "undef"]);

  // when dragentering e2, it should become preview
  await dispatchEvent(elements.e2.part2, "dragenter");
  expect(status()).toStrictEqual(["inact", "inact", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["ind", "ind", "prev", "prev", "undef"]);

  // after dragleaving e2, both e1 and e2 should be indicator
  await dispatchEvent(elements.e2.part1, "dragleave");
  expect(status()).toStrictEqual(["inact", "inact", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["ind", "ind", "ind", "ind", "undef"]);

  // when dragentering e3, nothing should happen
  await dispatchEvent(elements.e3.part1, "dragenter");
  expect(status()).toStrictEqual(["inact", "inact", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["ind", "ind", "ind", "ind", "undef"]);

  // when dragleaving e3, nothing should happen either
  await dispatchEvent(elements.e3.part1, "dragleave");
  expect(status()).toStrictEqual(["inact", "inact", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["ind", "ind", "ind", "ind", "undef"]);

  // when drop is canceled, it should snap back to e1 being active
  // need to dispatch the dragend over e1, in reality this is not necessary
  await dispatchEvent(elements.e1.part1, "dragend");
  expect(status()).toStrictEqual(["act", "act", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["undef", "undef", "undef", "undef", "undef"]);

  // dragging e1 to e2 -> e2 should become active
  await dispatchEvent(elements.e1.part1, "dragstart");
  await dispatchEvent(elements.e2.part2, "dragenter");
  await dispatchEvent(elements.e2.part2, "drop");
  expect(status()).toStrictEqual(["inact", "inact", "act", "act", "act"]);
  expect(drag()).toStrictEqual(["undef", "undef", "undef", "undef", "undef"]);

  // dragging e2 to e2 -> e1 should become active
  await dispatchEvent(elements.e2.part2, "dragstart");
  await dispatchEvent(elements.e1.part1, "dragenter");
  await dispatchEvent(elements.e1.part2, "drop");
  expect(status()).toStrictEqual(["act", "act", "inact", "inact", "act"]);
  expect(drag()).toStrictEqual(["undef", "undef", "undef", "undef", "undef"]);
});

test("drag and drop after changing entry group", async function () {
  const c1 = [
    [DAY1, "16:29", "city1MainStationId"],
    [DAY1, "18:04", "city2MainStationId"],
  ];
  const c2 = [
    [DAY2, "16:29", "city1MainStationId"],
    [DAY2, "18:04", "city2MainStationId"],
  ];

  const e1 = await addEntryToCalendar(c1, { active: "active" });
  const e2 = await addEntryToCalendar(c2, { active: "active" });

  e2.dataset.group = e1.dataset.group; // now have the same group and should be drag&droppable
  await timeout(10); // give calendar time to update

  await dispatchEvent(DOM.calendarEntryParts[0], "dragstart");
  expect(drag()).toStrictEqual(["prev", "ind"]);
});

test("drop callback should be called after drop occurs", async function () {
  const entry = await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ]);

  const dropCallback = jest.fn();
  DOM.calendar.on("drop", dropCallback);

  await dispatchEvent(DOM.calendarEntryParts[0], "dragstart");
  await dispatchEvent(DOM.calendarEntryParts[1], "dragenter");
  await dispatchEvent(DOM.calendarEntryParts[2], "drop");
  expect(dropCallback).toBeCalledWith(entry);
});

test("can set group hover state from outside calendar", async function () {
  await addEntryToCalendar([
    [DAY1, "16:29", "city2MainStationId"],
    [DAY1, "18:04", "city3MainStationId"],
  ]);
  await addEntryToCalendar([
    [DAY2, "16:29", "city1MainStationId"],
    [DAY2, "18:04", "city2MainStationId"],
  ]);

  DOM.calendar.setHoverGroup("City1->City2");
  expect(isHover()).toStrictEqual([false, true]);

  DOM.calendar.setNoHoverGroup("City1->City2");
  expect(isHover()).toStrictEqual([false, false]);
});
