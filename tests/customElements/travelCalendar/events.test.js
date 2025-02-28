/**
 * @jest-environment jsdom
 */

import * as util from "tests/_calendarTestUtils.js";
import { jest } from "@jest/globals";
import {
  dispatchEvent,
  DOM,
  initDOMFromFile,
  timeout,
} from "../../_domUtils.js";

beforeEach(async () => {
  initDOMFromFile("index.html");
  await DOM.calendar.setAttribute("start-date", util.DATES[0]);
});

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
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  await DOM.calendar.appendChild(entry);

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
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  await DOM.calendar.appendChild(entry);

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
  const group = "Berlin->München";
  const other = "München->Verona";

  const e1 = util.createEntry(util.t1("16:29"), util.t2("18:04"), {
    group: group,
    active: "active",
  });
  const e2 = util.createEntry(util.t2("16:29"), util.t3("18:04"), {
    group: group,
    active: "",
  });
  const e3 = util.createEntry(util.t1("04:30"), util.t1("05:11"), {
    group: other,
    active: "active",
  });

  await DOM.calendar.appendChild(e1);
  await DOM.calendar.appendChild(e2);
  await DOM.calendar.appendChild(e3);

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
  const e1 = util.createEntry(util.t1("16:29"), util.t1("18:04"), {
    group: "group1",
    active: true,
  });
  const e2 = util.createEntry(util.t2("16:29"), util.t2("18:04"), {
    group: "group2",
    active: true,
  });
  await DOM.calendar.appendChild(e1);
  await DOM.calendar.appendChild(e2);

  e2.dataset.group = "group1"; // now have the same group and should be drag&droppable
  await timeout(10); // give calendar time to update

  await dispatchEvent(DOM.calendarEntryParts[0], "dragstart");
  expect(drag()).toStrictEqual(["prev", "ind"]);
});

test("drop callback should be called after drop occurs", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  await DOM.calendar.appendChild(entry);

  const dropCallback = jest.fn();
  DOM.calendar.on("drop", dropCallback);

  await dispatchEvent(DOM.calendarEntryParts[0], "dragstart");
  await dispatchEvent(DOM.calendarEntryParts[1], "dragenter");
  await dispatchEvent(DOM.calendarEntryParts[2], "drop");
  expect(dropCallback).toBeCalledWith(entry);
});

test("can set group hover state from outside calendar", async function () {
  const e1 = util.createEntry(util.t1("16:29"), util.t1("18:04"), {
    group: "group1",
  });
  const e2 = util.createEntry(util.t2("16:29"), util.t2("18:04"), {
    group: "group2",
  });
  await DOM.calendar.appendChild(e1);
  await DOM.calendar.appendChild(e2);

  DOM.calendar.setHoverGroup("group2");
  expect(isHover()).toStrictEqual([false, true]);

  DOM.calendar.setNoHoverGroup("group2");
  expect(isHover()).toStrictEqual([false, false]);
});
