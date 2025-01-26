/**
 * @jest-environment jsdom
 */

import * as util from "tests/calendarTestUtils.js";

beforeEach(() => util.createDocument());

test("date labels should be initialized", function () {
  const calendar = document.querySelector("#calendar");
  const got = util.getShadowDOMItems(calendar, ".date-label");

  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("15"),
    },
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("16"),
    },
    {
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("17"),
    },
  ]);
});

test("date labels should be updated when calendar date changes", async function () {
  const calendar = document.querySelector("#calendar");
  await calendar.setAttribute("start-date", "2023-03-20");

  const got = util.getShadowDOMItems(calendar, ".date-label");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("20"),
    },
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("21"),
    },
    {
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: 1,
      rowEnd: 2,
      innerHTML: expect.stringMatching("22"),
    },
  ]);
});
