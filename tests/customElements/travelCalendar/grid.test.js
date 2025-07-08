/**
 * @jest-environment jsdom
 */

import { initTestDOM, TEST_DOM } from "/tests/_helpers/domUtils.js";
import { COLUMN_FIRST_DAY } from "../../_helpers/calendarUtils.js";

beforeEach(async () => {
  initTestDOM();
});

test("date labels should be set correctly", async function () {
  await TEST_DOM.calendar.setAttribute("start-date", "2023-03-20");

  expect(TEST_DOM.calendarDateLabels.length).toBe(3);
  expect(TEST_DOM.calendarDateLabels[0]).toMatchDOMObject({
    innerHTML: expect.stringMatching("20"),
    style: {
      "grid-column": COLUMN_FIRST_DAY,
      "grid-row-start": 1,
      "grid-row-end": 2,
    },
  });
  expect(TEST_DOM.calendarDateLabels[1]).toMatchDOMObject({
    innerHTML: expect.stringMatching("21"),
    style: {
      "grid-column": COLUMN_FIRST_DAY + 1,
      "grid-row-start": 1,
      "grid-row-end": 2,
    },
  });
  expect(TEST_DOM.calendarDateLabels[2]).toMatchDOMObject({
    innerHTML: expect.stringMatching("22"),
    style: {
      "grid-column": COLUMN_FIRST_DAY + 2,
      "grid-row-start": 1,
      "grid-row-end": 2,
    },
  });
});
