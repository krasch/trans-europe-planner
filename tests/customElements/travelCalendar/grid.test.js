/**
 * @jest-environment jsdom
 */

const util = require("./util.js");

beforeEach(() => util.createDocument());

test("dateLabelsAtInitialization", function () {
  const calendar = document.querySelector("#calendar");
  const got = util.getShadowDOMItems(calendar, ".date-label");

  expect(got.all.gridColumn).toStrictEqual([2, 3, 4]);
  expect(got.all.gridRows).toStrictEqual([
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  expect(got.all.innerHTML[0]).toContain("15");
  expect(got.all.innerHTML[1]).toContain("16");
  expect(got.all.innerHTML[2]).toContain("17");
});

test("dateLabelsAfterDateChanged", async function () {
  const calendar = document.querySelector("#calendar");
  await calendar.setAttribute("start-date", "2023-03-20");

  const got = util.getShadowDOMItems(calendar, ".date-label");

  expect(got.all.gridColumn).toStrictEqual([2, 3, 4]);
  expect(got.all.gridRows).toStrictEqual([
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  expect(got.all.innerHTML[0]).toContain("20");
  expect(got.all.innerHTML[1]).toContain("21");
  expect(got.all.innerHTML[2]).toContain("22");
});
