import { test, expect } from "vitest";

import {
  DefaultMap,
  findFirstPosition,
  groupBy,
  intersection,
} from "app/utils/collections.js";

test("intersection", function () {
  expect(intersection(["A", "B", "C"], ["D", "E", "F"])).toStrictEqual([]);
  expect(intersection([], ["D", "E", "F"])).toStrictEqual([]);
  expect(intersection(["A", "B", "C"], [])).toStrictEqual([]);
  expect(intersection(["A", "B", "C"], ["D", "B", "F"])).toStrictEqual(["B"]);
  expect(intersection(["B", "C"], ["D", "B", "C"])).toStrictEqual(["B", "C"]);
});

test("findFirstPosition", function () {
  const filterFn = (item) => item === "D";

  expect(findFirstPosition([], filterFn)).toBe(null);
  expect(findFirstPosition(["A", "B", "C"], filterFn)).toBe(null);
  expect(findFirstPosition(["D"], filterFn)).toBe(0);
  expect(findFirstPosition(["A", "D", "C"], filterFn)).toBe(1);
  expect(findFirstPosition(["A", "D", "D"], filterFn)).toBe(1);
});

test("groupBy", function () {
  const items = [
    { key: 1, val: 10 },
    { key: 2, val: 11 },
    { key: 2, val: 12 },
    { key: "xyz", val: 13 },
    { key: 1, val: 14 },
  ];

  const exp = {
    1: [items[0], items[4]],
    2: [items[1], items[2]],
    xyz: [items[3]],
  };

  const got = groupBy(items, (i) => i.key);
  expect(got).toStrictEqual(exp);
});

test("groupByNoItems", function () {
  const items = [];

  const exp = {};

  const got = groupBy(items, (i) => i.key);
  expect(got).toStrictEqual(exp);
});

test("defaultMapScalar", function () {
  const map = new DefaultMap(() => "Hallo");
  expect(map.get("test")).toBe("Hallo");
});

test("defaultMapList", function () {
  const map = new DefaultMap(() => []);
  expect(map.get("test")).toStrictEqual([]);

  map.get("test").push("hallo");
  expect(map.get("test")).toStrictEqual(["hallo"]);
});

test("defaultMapDict", function () {
  const map = new DefaultMap(() => ({}));
  expect(map.get("test")).toStrictEqual({});

  map.get("test")["key"] = "value";
  expect(map.get("test")).toStrictEqual({ key: "value" });
});
