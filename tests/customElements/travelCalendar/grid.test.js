/**
 * @jest-environment jsdom
 */

import * as util from "tests/calendarTestUtils.js";
import { DOM, initDOMFromFile } from "../../domUtils.js";

beforeEach(() => {
  initDOMFromFile("index.html");
});

test("date labels should be set correctly", async function () {
  await DOM.calendar.setAttribute("start-date", "2023-03-20");

  expect(DOM.calendarDateLabels).toMatchDOMObject([
    {
      innerHTML: expect.stringMatching("20"),
      style: {
        "grid-column": util.COLUMN_FIRST_DAY,
        "grid-row-start": 1,
        "grid-row-end": 2,
      },
    },
    {
      innerHTML: expect.stringMatching("21"),
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 1,
        "grid-row-start": 1,
        "grid-row-end": 2,
      },
    },
    {
      innerHTML: expect.stringMatching("22"),
      style: {
        "grid-column": util.COLUMN_FIRST_DAY + 2,
        "grid-row-start": 1,
        "grid-row-end": 2,
      },
    },
  ]);
});
