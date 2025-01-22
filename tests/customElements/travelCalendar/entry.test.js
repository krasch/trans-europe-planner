/**
 * @jest-environment jsdom
 */

const util = require("./util.js");

beforeEach(() => util.createDocument());

test("one day entry", async function () {
  const entry = util.createEntry(util.t1("14:00"), util.t1("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 14 * 4,
      rowEnd: util.ROW_MIDNIGHT + 15 * 4,
      group: "default-group",
      color: "test-color",
      contains: ["header", "start", "destination"],
      isFirstPart: true,
      isLastPart: true,
    },
  ]);
});

test("one day entry ranging from midnight to just before midnight", async function () {
  const entry = util.createEntry(util.t1("00:00"), util.t1("23:59"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
    },
  ]);
});

test("entry that spans two columns/days", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t2("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    // part1
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 16.5 * 4,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      contains: ["header", "start"],
      group: "default-group",
      isFirstPart: true,
      isLastPart: false,
    },
    // part2
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 18 * 4,
      contains: ["destination"],
      group: "default-group",
      isFirstPart: false,
      isLastPart: true,
    },
  ]);
});

test("entry that spans three columns/days", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    // part1
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 16.5 * 4,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      contains: ["header", "start"],
      group: "default-group",
      isFirstPart: true,
      isLastPart: false,
    },
    // part2
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      contains: [],
      group: "default-group",
      isFirstPart: false,
      isLastPart: false,
    },
    // part3
    {
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 18 * 4,
      contains: ["destination"],
      group: "default-group",
      isFirstPart: false,
      isLastPart: true,
    },
  ]);
});

test("delete entry that spans three columns/days", async function () {
  const entry1 = util.createEntry(util.t1("16:29"), util.t3("18:04"));
  const entry2 = util.createEntry(util.t3("14:29"), util.t3("14:44"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry1);
  await calendar.appendChild(entry2);
  await calendar.removeChild(entry1);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    {
      // second entry that has not been deleted
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: util.ROW_MIDNIGHT + 14.5 * 4,
      rowEnd: util.ROW_MIDNIGHT + 14.75 * 4,
    },
  ]);
});

test("entry locations should be updated when calendar start date changes", async function () {
  const entry1 = util.createEntry(util.t2("14:00"), util.t3("15:00"));
  const entry2 = util.createEntry(util.t3("17:00"), util.t3("18:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry1);
  await calendar.appendChild(entry2);

  let got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data.map((e) => e.column)).toStrictEqual([
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 2,
    util.COLUMN_FIRST_DAY + 2,
  ]);

  // move date backward
  await calendar.setAttribute("start-date", util.DATES[1]);
  got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data.map((e) => e.column)).toStrictEqual([
    util.COLUMN_FIRST_DAY,
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 1,
  ]);

  // move date forward
  await calendar.setAttribute("start-date", util.DATES[0]);
  got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data.map((e) => e.column)).toStrictEqual([
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 2,
    util.COLUMN_FIRST_DAY + 2,
  ]);
});

test("entry parts should be moved when entry start/end change", async function () {
  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  entry.dataset.departureDatetime = util.t1("10:00");
  entry.dataset.arrivalDatetime = util.t2("14:00");
  await util.timeout(10); // give calendar time to update

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 10 * 4,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
    },
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 14 * 4,
    },
  ]);
});

test("entry parts group should be updated when entry group changes", async function () {
  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  entry.dataset.group = "OTHER-GROUP-VERY-RANDOM";
  await util.timeout(10); // give calendar time to update

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    { group: "OTHER-GROUP-VERY-RANDOM" },
    { group: "OTHER-GROUP-VERY-RANDOM" },
  ]);
});

test("entry parts active should be updated when external active status changes", async function () {
  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  // set active
  entry.dataset.active = "active";
  await util.timeout(10); // give calendar time to update

  let got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([{ isActive: true }, { isActive: true }]);

  // set inactive
  entry.dataset.active = "active";
  await util.timeout(10); // give calendar time to update

  got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([{ isActive: true }, { isActive: true }]);
});

test("entry parts color should be updated when external color changes", async function () {
  const entry = util.createEntry(util.t2("14:00"), util.t3("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  // change color
  entry.dataset.color = "new color";
  await util.timeout(10); // give calendar time to update

  let got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data).toMatchObject([
    { color: "new color" },
    { color: "new color" },
  ]);
});
