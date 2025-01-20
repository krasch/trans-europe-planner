/**
 * @jest-environment jsdom
 */

const {
  LookupUtil,
  MultipartCalendarEntry,
} = require("../../../script/components/calendar2/travelCalendar.js");

test("register and unregister from lookup util", async function () {
  const outer1 = document.createElement("div");
  const outer2 = document.createElement("div");
  const outer3 = document.createElement("div");

  const inner1 = new MultipartCalendarEntry(
    [0, 1, 2].map((i) => document.createElement("div")),
  );
  const inner2 = new MultipartCalendarEntry(
    [0, 1].map((i) => document.createElement("div")),
  );
  const inner3 = new MultipartCalendarEntry(
    [0, 1, 2, 3].map((i) => document.createElement("div")),
  );

  inner1.group = "group1";
  inner2.group = "group2";
  inner3.group = "group1";

  const lookup = new LookupUtil();
  lookup.register(outer1, inner1);
  lookup.register(outer2, inner2);
  lookup.register(outer3, inner3);

  expect(lookup.entry(outer1)).toBe(inner1);
  expect(lookup.entry(outer2)).toBe(inner2);
  expect(lookup.entry(outer3)).toBe(inner3);

  expect(lookup.parent(inner1.parts[1])).toBe(inner1);
  expect(lookup.parent(inner2.parts[1])).toBe(inner2);
  expect(lookup.parent(inner3.parts[1])).toBe(inner3);

  expect(lookup.entriesWithGroup("group1")).toStrictEqual([inner1, inner3]);
  expect(lookup.entriesWithGroup("group2")).toStrictEqual([inner2]);

  lookup.unregister(outer1);
  expect(lookup.entry(outer1)).toBe(undefined);
  expect(lookup.parent(inner1.parts[1])).toBe(undefined);
  expect(lookup.entriesWithGroup("group1")).toStrictEqual([inner3]);
  expect(lookup.entriesWithGroup("group2")).toStrictEqual([inner2]);

  lookup.register(outer1, inner1);
  expect(lookup.entry(outer1)).toBe(inner1);
  expect(lookup.parent(inner1.parts[1])).toBe(inner1);
  expect(lookup.entriesWithGroup("group1")).toStrictEqual([inner3, inner1]);
  expect(lookup.entriesWithGroup("group2")).toStrictEqual([inner2]);
});
