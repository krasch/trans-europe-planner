/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import * as motis from "app/data/motis/client.js";
import { query } from "app/data/motis/client.js";
import { Planner } from "app/data/planner/planner.js";
import { ConnectionId } from "app/types/connection.js";
import { Itinerary } from "app/types/itinerary.js";

import {
  connectionFromShorthand as _c,
  itineraryFromShortHand as _i,
  DAY1,
} from "tests/_helpers/data.js";
import { initTestDOM } from "tests/_helpers/domUtils.js";

beforeEach(async () => {
  initTestDOM();

  vi.mock("app/data/motis/client.js", () => {
    return { direct: vi.fn(), plan: vi.fn() };
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

test("Get connection by id should pick right connection from all direct connection", async () => {
  const connections = [
    _c("T1: S1@D1T10->S2@D1T11->S3@D1T12"), // wrong trip id
    _c("T2: S1@D2T10->S2@D2T11->S3@D2T12"), // wrong date
    _c("T2: S1@D1T10->S2@D1T11->S3@D1T12"), // the one we are after
  ];

  // @ts-ignore
  motis.direct.mockImplementation(async () => connections);

  const planner = new Planner();

  const queryId = new ConnectionId("T2", "S1", "S3", DAY1);
  const result = await planner.connectionForId(queryId, DAY1);

  expect(result).toBe(connections[2]);
});

test("When getting same connection twice it should hit the cache", async () => {
  const connections = [
    _c("T1: S1@D1T10->S2@D1T11->S3@D1T12"),
    _c("T2: S1@D2T11->S2@D2T12->S3@D2T13"),
  ];

  // @ts-ignore
  motis.direct.mockImplementation(async () => connections);

  const planner = new Planner();

  // two calls for same trip id and date
  const queryId = new ConnectionId("T1", "S1", "S3", DAY1);
  await planner.connectionForId(queryId, DAY1);
  const result = await planner.connectionForId(queryId, DAY1);

  // should only have triggered one motis call
  expect(motis.direct).toBeCalledTimes(1);
  expect(result).toBe(connections[0]);
});

test("When getting two trips with same to/from it should hit the cache", async () => {
  const connections = [
    _c("T1: S1@D1T10->S2@D1T11->S3@D1T12"),
    _c("T2: S1@D1T11->S2@D1T12->S3@D1T13"),
    _c("T1: S1@D2T10->S2@D2T11->S3@D2T12"),
  ];

  // @ts-ignore
  motis.direct.mockImplementation(async () => connections);

  const planner = new Planner();

  // two different trip dates but everything else is the same
  const queryId1 = new ConnectionId("T1", "S1", "S3", DAY1);
  const queryId2 = new ConnectionId("T1", "S1", "S3", DAY1.plus({ days: 1 }));

  await planner.connectionForId(queryId1, DAY1);
  const result = await planner.connectionForId(queryId2, DAY1);

  // should only have triggered one motis call
  expect(motis.direct).toBeCalledTimes(1);
  expect(result).toBe(connections[2]);
});

test("Should resolve all connections in an itinerary", async () => {
  const connections = {
    "S1->S2": [
      _c("T1: S1@D1T10->S2@D1T11"), // this is the right one
      _c("T11: S1@D1T11->S2@D1T12"),
      _c("T1: S1@D2T10->S2@D2T11"),
    ],
    "S2->S3": [
      _c("T2: S2@D1T13->S3@D1T14"), // this is the right one
    ],
    "S3->S4": [
      _c("T3: S3@D1T10->S4@D1T11"),
      _c("T3: S3@D2T11->S4@D2T12"), // this is the right one
    ],
  };

  // @ts-ignore
  motis.direct.mockImplementation(
    async (from, to) => connections[`${from}->${to}`],
  );

  const planner = new Planner();

  const ids = [
    new ConnectionId("T1", "S1", "S2", DAY1),
    new ConnectionId("T2", "S2", "S3", DAY1),
    new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 })),
  ];

  const result = await planner.itineraryForIds(ids, DAY1);
  expect(result).toStrictEqual(
    new Itinerary([
      connections["S1->S2"][0],
      connections["S2->S3"][0],
      connections["S3->S4"][1],
    ]),
  );
});

test("Alternative connections should not include the current connection", async () => {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c2 = _c("T1: S1@D2T11->S2@D2T12->S3@D2T13");
  const c3 = _c("T2: S1@D1T12->S2@D1T13->S3@D1T14");
  const c4 = _c("T2: S1@D2T12->S2@D2T13->S3@D2T14");
  const c5 = _c("T2: S1@D3T12->S2@D3T13->S3@D3T14");

  // @ts-ignore
  motis.direct.mockImplementation(async () => [c1, c2, c3, c4, c5]);

  const planner = new Planner();
  const result = await planner.alternativeConnections(c4, DAY1);

  expect(result).toStrictEqual([c1, c2, c3, c5]);
});

test("Should get alternative connections for all connections in itinerary", async () => {
  const connections = {
    "S1->S2": [
      _c("T1: S1@D1T10->S2@D1T11"), // this is the current one
      _c("T11: S1@D1T11->S2@D1T12"), // this is an alternative
      _c("T1: S1@D2T10->S2@D2T11"), // this is an alternative
    ],
    "S2->S3": [
      _c("T2: S2@D1T13->S3@D1T14"), // this is the current one
    ],
    "S3->S4": [
      _c("T3: S3@D1T10->S4@D1T11"), // this is an alternative
      _c("T3: S3@D2T11->S4@D2T12"), // this is the current one
    ],
  };

  // @ts-ignore
  motis.direct.mockImplementation(
    async (from, to) => connections[`${from}->${to}`],
  );

  const planner = new Planner();

  const itinerary = new Itinerary([
    connections["S1->S2"][0],
    connections["S2->S3"][0],
    connections["S3->S4"][1],
  ]);
  const result = await planner.allAlternativeConnections(itinerary, DAY1);

  const exp = [
    [connections["S1->S2"][1], connections["S1->S2"][2]],
    [],
    [connections["S3->S4"][0]],
  ];
  expect(result).toStrictEqual(exp);
});

test("Alternative itineraries should not include the current georoute", async () => {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11->S3@D1T17"]);
  const i2 = _i(["T1: S1@D2T10->S2@D2T11->S3@D2T17"]);
  const i3 = _i(["T2: S1@D1T10->S4@D1T11", "T3: S4@D1T12->S3@D1T17"]);
  const i4 = _i(["T2: S1@D2T10->S4@D2T11", "T3: S4@D2T12->S3@D2T17"]);

  // @ts-ignore
  motis.plan.mockImplementation(async () => [i1, i2, i3, i4]);

  const planner = new Planner();
  const result = await planner.alternativeRouteItineraries(i3, DAY1);

  expect(result).toStrictEqual([i1]);
});

test("Plan should return one itinerary per geoRoute", async () => {
  // neither of these is pareto-optimal
  // todo test without all the scoring logic?
  const i1 = _i(["T1: S1@D1T10->S2@D1T11->S3@D1T17"]);
  const i2 = _i(["T1: S1@D2T10->S2@D2T11->S3@D2T17"]);
  const i3 = _i(["T2: S1@D1T10->S4@D1T11", "T3: S4@D1T12->S3@D1T17"]);
  const i4 = _i(["T2: S1@D2T10->S4@D2T11", "T3: S4@D2T12->S3@D2T17"]);

  // @ts-ignore
  motis.plan.mockImplementation(async () => [i1, i2, i3, i4]);

  const planner = new Planner();
  const result = await planner.plan("S1", "S2", DAY1);

  // should only have triggered one motis call
  expect(result).toStrictEqual([i1, i3]);
});

test("Planning same thing for a second time should hit the cache", async () => {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11->S3@D1T17"]);

  // @ts-ignore
  motis.plan.mockImplementation(async () => [i1]);

  const planner = new Planner();
  await planner.plan("S1", "S2", DAY1);
  const result = await planner.plan("S1", "S2", DAY1);

  // should only have triggered one motis call
  expect(motis.plan).toBeCalledTimes(1);
  expect(result).toStrictEqual([i1]);

  // should also be able to get the connection details via cache
  const queryId1 = new ConnectionId("T1", "S1", "S3", DAY1);
  await planner.connectionForId(queryId1, DAY1);
  expect(motis.direct).toBeCalledTimes(0);
});
