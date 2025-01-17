/**
 * @jest-environment jsdom
 */

const util = require("./util.js");

beforeEach(() => util.createDocument());

test("oneDayEntry", async function () {
  const entry = util.createEntry(util.t1("14:00"), util.t1("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([util.COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([
    [util.ROW_MIDNIGHT + 14 * 4, util.ROW_MIDNIGHT + 15 * 4],
  ]);
  expect(got.all.childClasses).toStrictEqual([
    ["header", "start", "destination"],
  ]);
  expect(got.all.group).toStrictEqual(["default-group"]);
});

test("oneDayEntryMidnightToJustBeforeMidnight", async function () {
  const entry = util.createEntry(util.t1("00:00"), util.t1("23:59"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([util.COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([
    [util.ROW_MIDNIGHT, util.ROW_MIDNIGHT + 24 * 4],
  ]);
});

test("twoDayEntry", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t2("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([
    util.COLUMN_FIRST_DAY,
    util.COLUMN_FIRST_DAY + 1,
  ]);
  expect(got.all.gridRows).toStrictEqual([
    [util.ROW_MIDNIGHT + 16.5 * 4, util.ROW_MIDNIGHT + 24 * 4],
    [util.ROW_MIDNIGHT, util.ROW_MIDNIGHT + 18 * 4],
  ]);

  expect(got.all.childClasses).toStrictEqual([
    ["header", "start"],
    ["destination"],
  ]);

  expect(got.all.group).toStrictEqual(["default-group", "default-group"]);
});

/*test("entrySecondDateWithCalendarDateChange", async function () {
  const entry = createEntry(t2("14:00"), t2("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  await calendar.setAttribute("start-date", SECOND_DATE);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 14 * 4, ROW_MIDNIGHT + 15 * 4],
  ]);
});*/

test("entryThreeDays", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = util.getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([
    util.COLUMN_FIRST_DAY,
    util.COLUMN_FIRST_DAY + 1,
    util.COLUMN_FIRST_DAY + 2,
  ]);
  expect(got.all.gridRows).toStrictEqual([
    [util.ROW_MIDNIGHT + 16.5 * 4, util.ROW_MIDNIGHT + 24 * 4],
    [util.ROW_MIDNIGHT, util.ROW_MIDNIGHT + 24 * 4],
    [util.ROW_MIDNIGHT, util.ROW_MIDNIGHT + 18 * 4],
  ]);
  expect(got.all.childClasses).toStrictEqual([
    ["header", "start"],
    [],
    ["destination"],
  ]);
  expect(got.all.group).toStrictEqual([
    "default-group",
    "default-group",
    "default-group",
  ]);
});
