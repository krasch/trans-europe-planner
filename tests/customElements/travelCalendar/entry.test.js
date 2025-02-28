/**
 * @jest-environment jsdom
 */

import { DOM, initDOMFromFile, timeout } from "tests/_domUtils.js";
import {
  CALENDAR_GRID,
  DAY1,
  DAY2,
  DAY3,
  createConnection,
  connectionToCalendarEntry,
} from "tests/_data.js";

beforeEach(async () => {
  initDOMFromFile("index.html");
  await DOM.calendar.setAttribute("start-date", DAY1);
});

async function addEntryToCalendar(connection, kwargs) {
  const entry = connectionToCalendarEntry(createConnection(connection), kwargs);
  await DOM.calendar.appendChild(entry);
  return entry;
}

test("one day entry should create one entry part that contains all connection info", async function () {
  await addEntryToCalendar([
    [DAY1, "14:00", "city1MainStationId"],
    [DAY1, "15:00", "city2MainStationId"],
  ]);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 14 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 15 * 4,
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
  await addEntryToCalendar([
    [DAY1, "00:00", "city1MainStationId"],
    [DAY1, "23:59", "city2MainStationId"],
  ]);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
      },
    },
  ]);
});

test("entry that spans two columns/days", async function () {
  await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY2, "18:04", "city2MainStationId"],
  ]);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 16.5 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
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
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 18 * 4,
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
  await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ]);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      dataset: {
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 16.5 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
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
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
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
        group: "City1->City2",
        status: "inactive",
      },
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 18 * 4,
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
  const entry1 = await addEntryToCalendar([
    [DAY1, "16:29", "city1MainStationId"],
    [DAY3, "18:04", "city2MainStationId"],
  ]);
  const entry2 = await addEntryToCalendar([
    [DAY3, "14:29", "city1MainStationId"],
    [DAY3, "14:44", "city2MainStationId"],
  ]);

  await DOM.calendar.removeChild(entry1);

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 14.5 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 14.75 * 4,
      },
    },
  ]);
});

test("entry locations should be updated when calendar start date changes", async function () {
  const entryColumns = () =>
    DOM.calendarEntryParts.map((e) => e.style._values["grid-column"]);

  await addEntryToCalendar([
    [DAY2, "14:00", "city1MainStationId"],
    [DAY3, "15:00", "city2MainStationId"],
  ]);
  await addEntryToCalendar([
    [DAY3, "17:00", "city1MainStationId"],
    [DAY3, "18:00", "city2MainStationId"],
  ]);

  expect(entryColumns()).toStrictEqual([
    CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
  ]);

  // move date forward
  await DOM.calendar.setAttribute("start-date", DAY2);
  expect(entryColumns()).toStrictEqual([
    CALENDAR_GRID.COLUMN_FIRST_DAY,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
  ]);

  // move date backward
  await DOM.calendar.setAttribute("start-date", DAY1);
  expect(entryColumns()).toStrictEqual([
    CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
    CALENDAR_GRID.COLUMN_FIRST_DAY + 2,
  ]);
});

test("entry parts should be moved when entry start/end change", async function () {
  const entry = await addEntryToCalendar([
    [DAY2, "14:00", "city1MainStationId"],
    [DAY3, "15:59", "city2MainStationId"],
  ]);

  entry.dataset.departureDatetime = `${DAY1}T10:00`;
  entry.dataset.arrivalDatetime = `${DAY2}T14:00`;
  await timeout(10); // give calendar time to update

  expect(DOM.calendarEntryParts).toMatchDOMObject([
    {
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT + 10 * 4,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 24 * 4,
      },
    },
    {
      style: {
        "grid-column": CALENDAR_GRID.COLUMN_FIRST_DAY + 1,
        "grid-row-start": CALENDAR_GRID.ROW_MIDNIGHT,
        "grid-row-end": CALENDAR_GRID.ROW_MIDNIGHT + 14 * 4,
      },
    },
  ]);
});

test("entry parts group should be updated when entry group changes", async function () {
  const groups = () => DOM.calendarEntryParts.map((e) => e.dataset.group);

  const entry = await addEntryToCalendar([
    [DAY2, "14:00", "city1MainStationId"],
    [DAY3, "15:00", "city2MainStationId"],
  ]);

  entry.dataset.group = "OTHER-GROUP-VERY-RANDOM";
  await timeout(10); // give calendar time to update

  expect(groups()).toMatchObject([
    "OTHER-GROUP-VERY-RANDOM",
    "OTHER-GROUP-VERY-RANDOM",
  ]);
});

test("entry parts active should be updated when external active status changes", async function () {
  const status = () => DOM.calendarEntryParts.map((e) => e.dataset.status);

  const entry = await addEntryToCalendar([
    [DAY2, "14:00", "city1MainStationId"],
    [DAY3, "15:00", "city2MainStationId"],
  ]);

  // set active
  entry.dataset.active = "active";
  await timeout(10); // give calendar time to update
  expect(status()).toMatchObject(["active", "active"]);

  // set inactive
  entry.dataset.active = "";
  await timeout(10); // give calendar time to update
  expect(status()).toMatchObject(["inactive", "inactive"]);
});

test("entry parts color should be updated when external color changes", async function () {
  const color = () =>
    DOM.calendarEntryParts.map((e) => e.style._values["--color"]);

  const entry = await addEntryToCalendar([
    [DAY2, "14:00", "city1MainStationId"],
    [DAY3, "15:00", "city2MainStationId"],
  ]);

  // change color
  entry.dataset.color = "new color";
  await timeout(10); // give calendar time to update
  expect(color()).toMatchObject(["new color", "new color"]);
});
