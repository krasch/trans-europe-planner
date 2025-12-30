import { test, expect, vi } from "vitest";

import { Planner } from "script/data/planner.js";
import { Itinerary } from "script/types/itinerary.js";

import { connectionFromShorthand as _c, DAY1 } from "tests/_helpers/data.js";

function mockDatasource() {
  return {
    plan: vi.fn(),
    direct: vi.fn(),
    constructURL: vi.fn(),
  };
}

test("Group itineraries per route and pick one each", async function () {
  const c1 = _c("T1: S1@D1T12->S2@D1T13");
  const c2 = _c("T3: S2@D1T14->S3@D1T15");
  const i1 = new Itinerary([c1, c2]);

  // same route as the first itinerary
  const c1_alt = _c("T2: S1@D2T12->S2@D2T13");
  const c2_alt = _c("T4: S2@D2T14->S3@D2T15");
  const i1_alt = new Itinerary([c1_alt, c2_alt]);

  // different route
  const c3 = _c("T5: S1@D1T12->S3@D1T13");
  const i2 = new Itinerary([c3]);

  const mockSource = mockDatasource();
  mockSource.plan.mockReturnValueOnce([i1, i1_alt, i2]);

  const db = new Planner(mockSource, null);

  const got = await db.plan("S1", "S3", DAY1);
  expect(got).toStrictEqual([i1, i2]);
});

test("Alternatives for empty itinerary", async function () {
  const db = new Planner(null, null);

  const got = await db.getCachedAlternatives(null, DAY1);
  expect(got).toStrictEqual(null);
});

test("Alternatives for itinerary", async function () {
  const c1 = _c("T1: S1@D1T12->S2@D1T13");
  const c2 = _c("T2: S2@D1T14->S3@D1T15");
  const i1 = new Itinerary([c1, c2]);

  const c1_alt = _c("T3: S1@D2T12->S2@D2T13");
  const c1_alt2 = _c("T4: S1@D3T14->S2@D3T15");

  const mockSource = mockDatasource();
  mockSource.direct.mockReturnValueOnce([c1_alt, c1_alt2]); // first call
  mockSource.direct.mockReturnValueOnce([]); // second call

  const db = new Planner(mockSource, null);

  const got = await db.getCachedAlternatives(i1, DAY1);
  expect(got).toStrictEqual([[c1_alt, c1_alt2], []]);
});
