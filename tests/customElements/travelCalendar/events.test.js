/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";

import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

import {
  dispatchTestEvent,
  initTestDOM,
  TEST_DOM,
  timeout,
} from "/tests/_helpers/domUtils.js";
import { DAY1 } from "/tests/_helpers/data.js";
import { addEntryToCalendar } from "/tests/_helpers/calendarUtils.js";

beforeEach(async () => {
  initTestDOM();
  await TEST_DOM.calendar.setAttribute("start-date", DAY1);
});

// for making the testing code more condensed and readible (hopefully)
const selectors = {
  _active: (e) => {
    switch (e.dataset.status) {
      case "active":
        return "1";
      case "inactive":
        return "0";
      default:
        throw new Error();
    }
  },

  _drag: (e) => {
    switch (e.dataset.dragStatus) {
      case undefined:
        return "?";
      case "indicator":
        return "ind";
      case "preview":
        return "prev";
      default:
        throw new Error();
    }
  },

  _hover: (e) => {
    if (e.classList.contains("hover")) return "1";
    else return "0";
  },

  get hover() {
    return TEST_DOM.calendarEntryParts.map((e) => this._hover(e)).join(" ");
  },

  get active() {
    return TEST_DOM.calendarEntryParts.map((e) => this._active(e)).join(" ");
  },

  get drag() {
    return TEST_DOM.calendarEntryParts.map((e) => this._drag(e)).join(" ");
  },
};

test("when hovering over a part of multiparty entry, then all parts should hover", async function () {
  await addEntryToCalendar("T1: S1@D1T10->S2@D3T11"); // 3-day entry

  // by default no part should hover
  expect(selectors.hover).toStrictEqual("0 0 0");

  // after mouseover all parts should hover
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "mouseover");
  expect(selectors.hover).toStrictEqual("1 1 1");

  // after mouseout no parts should hover
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[2], "mouseout");
  expect(selectors.hover).toStrictEqual("0 0 0");
});

test("hover on/off callback should be called when hovering over entry", async function () {
  const entry = await addEntryToCalendar("T1: S1@D1T10->S2@D3T11"); // 3-day entry

  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  TEST_DOM.calendar.on("hoverOn", hoverOnCallback);
  TEST_DOM.calendar.on("hoverOff", hoverOffCallback);

  // send mouseover on first part of entry
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith(entry);

  // send mouseout on third part of entry
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[2], "mouseout");
  expect(hoverOffCallback).toBeCalledWith(entry);
});

test("drag and drop of multi-part entries", async function () {
  // S1 (day1)-> S2 (day2)
  await addEntryToCalendar("T1: S1@D1T10->S2@D2T11", { active: "active" });
  // S1 (day2)-> S2 (day3)
  await addEntryToCalendar("T2: S1@D2T10->S2@D3T11", { active: "" });
  // S2 (day3)-> S3 (day3)
  await addEntryToCalendar("T3: S2@D3T14->S3@D3T15", { active: "active" });

  // this makes it easier to send events (and understand from which calendar entry event was sent)
  const elements = {
    e1: {
      part1: TEST_DOM.calendarEntryParts[0],
      part2: TEST_DOM.calendarEntryParts[1],
    },
    e2: {
      part1: TEST_DOM.calendarEntryParts[2],
      part2: TEST_DOM.calendarEntryParts[3],
    },
    e3: { part1: TEST_DOM.calendarEntryParts[4] },
  };

  // initial values
  expect(selectors.active).toStrictEqual("1 1 0 0 1");
  expect(selectors.drag).toStrictEqual("? ? ? ? ?");

  /// when starting dragging e1, it should turn inactive and preview and e2 should be indicator
  await dispatchTestEvent(elements.e1.part1, "dragstart");
  expect(selectors.active).toStrictEqual("0 0 0 0 1");
  expect(selectors.drag).toStrictEqual("prev prev ind ind ?");

  // when dragentering e2, it should become preview
  await dispatchTestEvent(elements.e2.part2, "dragenter");
  expect(selectors.active).toStrictEqual("0 0 0 0 1");
  expect(selectors.drag).toStrictEqual("ind ind prev prev ?");

  // after dragleaving e2, both e1 and e2 should be indicator
  await dispatchTestEvent(elements.e2.part1, "dragleave");
  expect(selectors.active).toStrictEqual("0 0 0 0 1");
  expect(selectors.drag).toStrictEqual("ind ind ind ind ?");

  // when dragentering e3, nothing should happen
  await dispatchTestEvent(elements.e3.part1, "dragenter");
  expect(selectors.active).toStrictEqual("0 0 0 0 1");
  expect(selectors.drag).toStrictEqual("ind ind ind ind ?");

  // when dragleaving e3, nothing should happen either
  await dispatchTestEvent(elements.e3.part1, "dragleave");
  expect(selectors.active).toStrictEqual("0 0 0 0 1");
  expect(selectors.drag).toStrictEqual("ind ind ind ind ?");

  // when drop is canceled, it should snap back to e1 being active
  // need to dispatch the dragend over e1, in reality this is not necessary
  await dispatchTestEvent(elements.e1.part1, "dragend");
  expect(selectors.active).toStrictEqual("1 1 0 0 1");
  expect(selectors.drag).toStrictEqual("? ? ? ? ?");

  // dragging e1 to e2 -> e2 should become active
  await dispatchTestEvent(elements.e1.part1, "dragstart");
  await dispatchTestEvent(elements.e2.part2, "dragenter");
  await dispatchTestEvent(elements.e2.part2, "drop");
  expect(selectors.active).toStrictEqual("0 0 1 1 1");
  expect(selectors.drag).toStrictEqual("? ? ? ? ?");

  // dragging e2 to e2 -> e1 should become active
  await dispatchTestEvent(elements.e2.part2, "dragstart");
  await dispatchTestEvent(elements.e1.part1, "dragenter");
  await dispatchTestEvent(elements.e1.part2, "drop");
  expect(selectors.active).toStrictEqual("1 1 0 0 1");
  expect(selectors.drag).toStrictEqual("? ? ? ? ?");
});

test("drag and drop after changing entry group", async function () {
  // first entry is S1->S2, second is S2->S2 => they have different groups
  const kwargs = { active: "active" };
  const e1 = await addEntryToCalendar("T1: S1@D1T10->S2@D1T11", kwargs);
  const e2 = await addEntryToCalendar("T2: S2@D2T10->S3@D2T11", kwargs);

  // now have the same group and should be drag&droppable
  e2.dataset.group = e1.dataset.group;
  await timeout(10); // give calendar time to update

  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "dragstart");
  expect(selectors.drag).toStrictEqual("prev ind");
});

test("drop callback should be called after drop occurs", async function () {
  const entry = await addEntryToCalendar("T1: S1@D1T10->S2@D3T11"); // 3-day entry

  const dropCallback = jest.fn();
  TEST_DOM.calendar.on("drop", dropCallback);

  await dispatchTestEvent(TEST_DOM.calendarEntryParts[0], "dragstart");
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[1], "dragenter");
  await dispatchTestEvent(TEST_DOM.calendarEntryParts[2], "drop");
  expect(dropCallback).toBeCalledWith(entry);
});

test("can set group hover state from outside calendar", async function () {
  const e1 = await addEntryToCalendar("T1: S1@D1T10->S2@D1T11"); // one day S1->S2
  const e2 = await addEntryToCalendar("T2: S2@D1T11->S3@D1T12"); // one day S2->S3

  TEST_DOM.calendar.setHoverGroup(e1.dataset.group);
  expect(selectors.hover).toStrictEqual("1 0");

  TEST_DOM.calendar.setNoHoverGroup(e1.dataset.group);
  expect(selectors.hover).toStrictEqual("0 0");
});
