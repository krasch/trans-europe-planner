/**
 * @vitest-environment jsdom
 */
import { test, expect, beforeEach } from "vitest";

import { ResponseCache } from "app/motis/cache.js";

const data = { key: "value", key2: 1234 };
const url1 = new URL("http://localhost:8080");
const url2 = new URL("http://localhost:8080?param=val");

beforeEach(() => {
  sessionStorage.clear();
});

test("cache miss", () => {
  const cache = new ResponseCache();
  expect(cache.get(url2)).toBe(null);

  cache.set(url1, data); // sets a different URL
  expect(cache.get(url2)).toBe(null);
});

test("cache hit", () => {
  const cache = new ResponseCache();
  cache.set(url1, data);
  expect(cache.get(url1)).toStrictEqual(data);
});

test("cache expired", () => {
  const cache = new ResponseCache(0.00000001);
  cache.set(url1, data);
  expect(cache.get(url1)).toBe(null);
});
