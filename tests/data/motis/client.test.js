/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, test, expect, vi } from "vitest";

import { query, plan, ErrorQueryingMotis } from "app/data/motis/client.js";
import { DateTime } from "app/types/dateTime.js";

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
    query("http://localhost:12345", { key: "value" }),
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

  await plan("S1", "S2", DateTime.fromISO("2025-10-10T14:00:00"));
  expect(fetch).toBeCalledTimes(1);

  // @ts-ignore
  const url = URL.parse(fetch.mock.calls[0][0]);
  const params = url.searchParams;
  expect(params.get("fromPlace")).toBe("S1");
  expect(params.get("toPlace")).toBe("S2");
  expect(params.get("time")).toBe(DateTime.fromISO("2025-10-10").toISO());
});
