/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, test, expect, vi } from "vitest";

import { query, plan, ErrorQueryingMotis } from "script/motis/client.js";
import { GeocodedLocation } from "script/motis/parser.js";
import { DateTime } from "script/types/dateTime.js";

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
});

test("Should throw error if MOTIS is down", async () => {
  global.fetch = vi.fn(() => Promise.reject("API is down"));

  await expect(
    query("http://localhost:8080", { key: "value" }),
  ).rejects.toThrowError(ErrorQueryingMotis);
});

test("Should throw error if response is not 200", async () => {
  // @ts-ignore
  global.fetch = vi.fn(() => Promise.resolve({ ok: false }));

  await expect(
    query("http://localhost:8080", { key: "value" }),
  ).rejects.toThrowError(ErrorQueryingMotis);
});

test("Plan query parameters should be filled correctly when using stops", async () => {
  // @ts-ignore
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({
        itineraries: [],
      }),
    }),
  );

  const from = new GeocodedLocation("stop", "Stop1", "S1", 10, 10);
  const to = new GeocodedLocation("stop", "Stop2", "S2", 20, 20);

  await plan(from, to, DateTime.fromISO("2025-10-10T14:00:00"));
  expect(fetch).toBeCalledTimes(1);

  // @ts-ignore
  const url = URL.parse(fetch.mock.calls[0][0]);
  const params = url.searchParams;
  expect(params.get("fromPlace")).toBe("S1");
  expect(params.get("toPlace")).toBe("S2");
  expect(params.get("time")).toBe(DateTime.fromISO("2025-10-10").toISO());
});

test("Plan query parameters should be filled correctly when using coordinates", async () => {
  // @ts-ignore
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => ({
        itineraries: [],
      }),
    }),
  );

  const from = new GeocodedLocation("place", "City1", null, 10.1, 11.2);
  const to = new GeocodedLocation("place", "City2", null, 20.2, 21.3);

  await plan(from, to, DateTime.fromISO("2025-10-10T14:00:00"));
  expect(fetch).toBeCalledTimes(1);

  // @ts-ignore
  const url = URL.parse(fetch.mock.calls[0][0]);
  const params = url.searchParams;
  expect(params.get("fromPlace")).toBe("10.1,11.2");
  expect(params.get("toPlace")).toBe("20.2,21.3");
  expect(params.get("time")).toBe(DateTime.fromISO("2025-10-10").toISO());
});
