import { expect, test } from "vitest";



import { DefaultMap } from "app/util.js";

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