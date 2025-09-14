/**
 * @jest-environment jsdom
 */
import {
  COLUMN_FIRST_DAY,
  ROW_MIDNIGHT,
  addEntryToCalendar,
} from "tests/_helpers/calendarUtils.js";
import { DAY1 } from "tests/_helpers/data.js";
import { initTestDOM, TEST_DOM, timeout } from "tests/_helpers/domUtils.js";

beforeEach(async () => {
  initTestDOM();
  await TEST_DOM.calendar.setAttribute("start-date", DAY1);
});

// todo can not test non-hourly entries
test("one day entry should create one entry part that contains all connection info", async function () {
  await addEntryToCalendar("T1: S1@D1T10->S2@D1T11");

  expect(TEST_DOM.calendarEntryParts.length).toBe(1);
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": ROW_MIDNIGHT + 10 * 4,
      "grid-row-end": ROW_MIDNIGHT + 11 * 4,
      "--color": "test-color",
    },
    // contains start and end info
    selectors: {
      ".start .time": { innerHTML: "10:00" },
      ".destination .time": { innerHTML: "11:00" },
    },
  });
});

test("one day entry ranging from midnight to just before midnight", async function () {
  await addEntryToCalendar("T1: S1@D1T00->S2@D1T23");

  expect(TEST_DOM.calendarEntryParts.length).toBe(1);
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": ROW_MIDNIGHT,
      "grid-row-end": ROW_MIDNIGHT + 23 * 4,
    },
  });
});

test("entry that spans two columns/days", async function () {
  await addEntryToCalendar("T1: S1@D1T16->S2@D2T14");

  expect(TEST_DOM.calendarEntryParts.length).toBe(2);
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": ROW_MIDNIGHT + 16 * 4,
      "grid-row-end": ROW_MIDNIGHT + 24 * 4,
      "--color": "test-color",
    },
    // first part contains start info
    selectors: {
      ".start .time": { innerHTML: "16:00" },
      ".destination .time": null,
    },
  });
  expect(TEST_DOM.calendarEntryParts[1]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY + 1,
      "grid-row-start": ROW_MIDNIGHT,
      "grid-row-end": ROW_MIDNIGHT + 14 * 4,
      "--color": "test-color",
    },
    // second part contains end info
    selectors: {
      ".start .time": null,
      ".destination .time": { innerHTML: "14:00" },
    },
  });
});

test("entry that spans three columns/days", async function () {
  await addEntryToCalendar("T1: S1@D1T16->S2@D3T02");

  expect(TEST_DOM.calendarEntryParts.length).toBe(3);
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": ROW_MIDNIGHT + 16 * 4,
      "grid-row-end": ROW_MIDNIGHT + 24 * 4,
      "--color": "test-color",
    },
    // first part contains start info
    selectors: {
      ".start .time": { innerHTML: "16:00" },
      ".destination .time": null,
    },
  });
  expect(TEST_DOM.calendarEntryParts[1]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY + 1,
      "grid-row-start": ROW_MIDNIGHT,
      "grid-row-end": ROW_MIDNIGHT + 24 * 4,
      "--color": "test-color",
    },
    // second part contains neither
    selectors: {
      ".start .time": null,
      ".destination .time": null,
    },
  });
  expect(TEST_DOM.calendarEntryParts[2]).toMatchDOMObject({
    dataset: {
      group: "S1->S2",
      status: "inactive",
    },
    style: {
      "grid-column": COLUMN_FIRST_DAY + 2,
      "grid-row-start": ROW_MIDNIGHT,
      "grid-row-end": ROW_MIDNIGHT + 2 * 4,
      "--color": "test-color",
    },
    // third part contains end info
    selectors: {
      ".start .time": null,
      ".destination .time": { innerHTML: "02:00" },
    },
  });
});

test("delete entry that spans three columns/days", async function () {
  const entry1 = await addEntryToCalendar("T1: S1@D1T16->S2@D3T02");
  const entry2 = await addEntryToCalendar("T2: S2@D2T07->S3@D2T08");
  expect(TEST_DOM.calendarEntryParts.length).toBe(4); // first entry has 3, second has 1

  // remove three-day entry
  await TEST_DOM.calendar.removeChild(entry1);

  expect(TEST_DOM.calendarEntryParts.length).toBe(1);
  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    style: {
      "grid-column": COLUMN_FIRST_DAY + 1,
      "grid-row-start": ROW_MIDNIGHT + 7 * 4,
      "grid-row-end": ROW_MIDNIGHT + 8 * 4,
    },
  });
});

test("entry locations should be updated when calendar start date changes", async function () {
  const entryColumns = () =>
    TEST_DOM.calendarEntryParts.map((e) =>
      Number(e.style.getPropertyValue("grid-column")),
    );

  await addEntryToCalendar("T1: S1@D2T16->S2@D3T02");
  await addEntryToCalendar("T2: S2@D3T07->S3@D3T08");

  expect(entryColumns()).toStrictEqual([
    COLUMN_FIRST_DAY + 1,
    COLUMN_FIRST_DAY + 2,
    COLUMN_FIRST_DAY + 2,
  ]);

  // move date forward
  await TEST_DOM.calendar.setAttribute("start-date", DAY1.plus({ days: 1 }));
  expect(entryColumns()).toStrictEqual([
    COLUMN_FIRST_DAY,
    COLUMN_FIRST_DAY + 1,
    COLUMN_FIRST_DAY + 1,
  ]);

  // move date backward
  await TEST_DOM.calendar.setAttribute("start-date", DAY1);
  expect(entryColumns()).toStrictEqual([
    COLUMN_FIRST_DAY + 1,
    COLUMN_FIRST_DAY + 2,
    COLUMN_FIRST_DAY + 2,
  ]);
});

test("entry parts should be moved when entry start/end change", async function () {
  const entry = await addEntryToCalendar("T1: S1@D2T16->S2@D3T02");

  // no longer a two-day entry
  entry.dataset.departureDatetime = DAY1.plus({ hours: 13 }).toISO();
  entry.dataset.arrivalDatetime = DAY1.plus({ hours: 17 }).toISO();
  await timeout(10); // give calendar time to update

  expect(TEST_DOM.calendarEntryParts[0]).toMatchDOMObject({
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": ROW_MIDNIGHT + 13 * 4,
      "grid-row-end": ROW_MIDNIGHT + 17 * 4,
    },
  });
});

test("entry parts group should be updated when entry group changes", async function () {
  const groups = () => TEST_DOM.calendarEntryParts.map((e) => e.dataset.group);

  const entry = await addEntryToCalendar("T1: S1@D2T14->S2@D3T15");

  // update group
  entry.dataset.group = "OTHER-GROUP-VERY-RANDOM";
  await timeout(10); // give calendar time to update

  expect(groups()).toMatchObject([
    "OTHER-GROUP-VERY-RANDOM",
    "OTHER-GROUP-VERY-RANDOM",
  ]);
});

test("entry parts active should be updated when external active status changes", async function () {
  const status = () => TEST_DOM.calendarEntryParts.map((e) => e.dataset.status);

  const entry = await addEntryToCalendar("T1: S1@D2T14->S2@D3T15");

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
    TEST_DOM.calendarEntryParts.map((e) => e.style.getPropertyValue("--color"));

  const entry = await addEntryToCalendar("T1: S1@D2T14->S2@D3T15");

  // change color
  entry.dataset.color = "new color";
  await timeout(10); // give calendar time to update
  expect(color()).toMatchObject(["new color", "new color"]);
});
