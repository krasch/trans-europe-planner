/**
 * @jest-environment jsdom
 */

import * as util from "tests/calendarTestUtils.js";
import { initDOMFromFile, DOM } from "../../domUtils.js";

beforeEach(async () => {
  initDOMFromFile("index.html");
  await DOM.calendar.setAttribute("start-date", util.DATES[0]);
});

test("one day entry should create one entry part that contains all connection info", async function () {
  const entry = util.createEntry(util.t1("14:00"), util.t1("15:00"));
  await DOM.calendar.appendChild(entry);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 14 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 15 * 4,
        "--color": "test-color",
      },
      // contains start and end info
      selectors: {
        ".start .time": { innerHTML: "14:00" },
        ".destination .time": { innerHTML: "15:00" },
      },
    },
  ]);
});

test("one day entry ranging from midnight to just before midnight", async function () {
  const entry = util.createEntry(util.t1("00:00"), util.t1("23:59"));
  await DOM.calendar.appendChild(entry);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
      },
    },
  ]);
});

test("entry that spans two columns/days", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t2("18:04"));
  await DOM.calendar.appendChild(entry);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 16.5 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
        "--color": "test-color",
      },
      // first part contains start info
      selectors: {
        ".start .time": { innerHTML: "16:29" },
        ".destination .time": null,
      },
    },
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 18 * 4,
        "--color": "test-color",
      },
      // second part contains end info
      selectors: {
        ".start .time": null,
        ".destination .time": { innerHTML: "18:04" },
      },
    },
  ]);
});

test("entry that spans three columns/days", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  await DOM.calendar.appendChild(entry);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 16.5 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
        "--color": "test-color",
      },
      // first part contains start info
      selectors: {
        ".start .time": { innerHTML: "16:29" },
        ".destination .time": null,
      },
    },
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
        "--color": "test-color",
      },
      // second part contains neither
      selectors: {
        ".start .time": null,
        ".destination .time": null,
      },
    },
    {
      dataset: {
        group: "default-group",
        status: "inactive",
      },
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 2,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 18 * 4,
        "--color": "test-color",
      },
      // third part contains end info
      selectors: {
        ".start .time": null,
        ".destination .time": { innerHTML: "18:04" },
      },
    },
  ]);
});

test("delete entry that spans three columns/days", async function () {
  const entry1 = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  const entry2 = util.createEntry(util.t3("14:29"), util.t3("14:44"));

  await DOM.calendar.appendChild(entry1);
  await DOM.calendar.appendChild(entry2);
  await DOM.calendar.removeChild(entry1);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 2,
        "grid-row-start": util.ROW_MIDNIGHT + 14.5 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 14.75 * 4,
      },
    },
  ]);
});

test("entry locations should be updated when calendar start date changes", async function () {
  const entryColumns = () =>
    DOM.calendarEntryParts.map((e) => e.style._values["grid-column"]);

  const entry1 = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  const entry2 = util.createEntry(util.t3("17:00"), util.t3("18:00"));

  await DOM.calendar.appendChild(entry1);
  await DOM.calendar.appendChild(entry2);

  expect(entryColumns()).toStrictEqual([
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 2,
    util.COLUMN_FIRST_DAY + 2,
  ]);

  // move date forward
  await DOM.calendar.setAttribute("start-date", util.DATES[1]);
  expect(entryColumns()).toStrictEqual([
    util.COLUMN_FIRST_DAY,
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 1,
  ]);

  // move date backward
  await DOM.calendar.setAttribute("start-date", util.DATES[0]);
  expect(entryColumns()).toStrictEqual([
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 2,
    util.COLUMN_FIRST_DAY + 2,
  ]);
});

test("entry parts should be moved when entry start/end change", async function () {
  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  await DOM.calendar.appendChild(entry);

  entry.dataset.departureDatetime = util.t1("10:00");
  entry.dataset.arrivalDatetime = util.t2("14:00");
  await util.timeout(10); // give calendar time to update

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": util.ROW_MIDNIGHT + 10 * 4,
        "grid-row-end": util.ROW_MIDNIGHT + 24 * 4,
      },
    },
    {
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": util.ROW_MIDNIGHT,
        "grid-row-end": util.ROW_MIDNIGHT + 14 * 4,
      },
    },
  ]);
});

test("entry parts group should be updated when entry group changes", async function () {
  const groups = () => DOM.calendarEntryParts.map((e) => e.dataset.group);

  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  await DOM.calendar.appendChild(entry);

  entry.dataset.group = "OTHER-GROUP-VERY-RANDOM";
  await util.timeout(10); // give calendar time to update

  expect(groups()).toMatchObject([
    "OTHER-GROUP-VERY-RANDOM",
    "OTHER-GROUP-VERY-RANDOM",
  ]);
});

test("entry parts active should be updated when external active status changes", async function () {
  const status = () => DOM.calendarEntryParts.map((e) => e.dataset.status);

  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  await DOM.calendar.appendChild(entry);

  // set active
  entry.dataset.active = "active";
  await util.timeout(10); // give calendar time to update
  expect(status()).toMatchObject(["active", "active"]);

  // set inactive
  entry.dataset.active = "";
  await util.timeout(10); // give calendar time to update
  expect(status()).toMatchObject(["inactive", "inactive"]);
});

test("entry parts color should be updated when external color changes", async function () {
  const color = () =>
    DOM.calendarEntryParts.map((e) => e.style._values["--color"]);

  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  await DOM.calendar.appendChild(entry);

  // change color
  entry.dataset.color = "new color";
  await util.timeout(10); // give calendar time to update
  expect(color()).toMatchObject(["new color", "new color"]);
});
