/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import * as motis from "app/data/motis/client.js";
import { GeocodedLocation } from "app/data/motis/parser.js";
import { Planner } from "app/data/planner/planner.js";
import { render } from "app/render.js";
import { Itinerary } from "app/types/itinerary.js";
import { setURLState } from "app/url.js";

import {
  DAY1,
  itineraryFromShortHand as _i,
  connectionFromShorthand as _c,
} from "tests/_helpers/data.js";

const CONNECTIONS = {
  "S1->S2": [
    _c("T1: S1@D1T10->S2@D1T11"),
    _c("T1b: S1@D1T11->S2@D1T12"),
    _c("T1: S1@D2T10->S2@D2T11"),
  ],
  "S2->S3": [_c("T2: S2@D1T13->S3@D1T14")],
  "S3->S4": [_c("T3: S3@D1T10->S4@D1T11"), _c("T3: S3@D2T11->S4@D2T12")],
  "S1->S4": [_c("T4: S1@D1T10->S4@D3T11")],
};

beforeEach(async () => {
  vi.mock("app/data/motis/client.js", () => {
    return {
      getStopInfo: vi.fn(
        async (s) => new GeocodedLocation("stop", s, s, 10, 10),
      ),
      direct: vi.fn(async (from, to) => CONNECTIONS[`${from}->${to}`]),
      // this will be test-specific
      plan: vi.fn(),
    };
  });

  vi.mock("app/url.js", () => {
    return { setURLState: vi.fn() };
  });
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

function mockComponents() {
  return {
    config: { updateView: vi.fn(), lock: vi.fn(), unlock: vi.fn() },
    map: { updateView: vi.fn() },
    calendar: { updateView: vi.fn() },
    perlschnur: { updateView: vi.fn() },
  };
}

test("If not all of from/to/date are set, stopIds should get resolved but nothing else should happen", async () => {
  const urlData = { from: "S1", to: "S2", date: null, trips: [] };

  const components = mockComponents();

  // @ts-ignore
  await render(components, new Planner(), urlData);

  // no components except config are updated in this round
  expect(setURLState).not.toHaveBeenCalled();
  expect(components.config.updateView).toHaveBeenCalledWith("S1", "S2", null);
  expect(components.map.updateView).not.toHaveBeenCalled();
  expect(components.calendar.updateView).not.toHaveBeenCalled();
  expect(components.perlschnur.updateView).not.toHaveBeenCalled();
});

test("If from/to/date are all set but no itinerary is given, then planning should happen and URL updated", async () => {
  // will return this one first from planning -> should become active itinerary
  const i1 = new Itinerary([
    CONNECTIONS["S1->S2"][0],
    CONNECTIONS["S2->S3"][0],
    CONNECTIONS["S3->S4"][1],
  ]);
  // this one will be returned second from planning -> irrelevant for now
  const i2 = new Itinerary([CONNECTIONS["S1->S4"][0]]);

  // @ts-ignore
  motis.plan.mockImplementation(() => [i1, i2]);

  // here are our inputs
  const urlData = { from: "S1", to: "S4", date: DAY1, connectionIds: [] };

  // @ts-ignore
  const components = mockComponents();
  await render(components, new Planner(), urlData);

  // no components except config are updated in this round
  expect(setURLState).toHaveBeenCalledWith("S1", "S4", DAY1, i1.connectionIds);
  expect(components.config.updateView).toHaveBeenCalledWith("S1", "S4", DAY1);
  expect(components.map.updateView).not.toHaveBeenCalled();
  expect(components.calendar.updateView).not.toHaveBeenCalled();
  expect(components.perlschnur.updateView).not.toHaveBeenCalled();
});

test("If an itinerary is set in url, it should get resolved, alternatives loaded and everything rendered", async () => {
  // this is the one we will put in the URL
  const i1 = new Itinerary([
    CONNECTIONS["S1->S2"][0],
    CONNECTIONS["S2->S3"][0],
    CONNECTIONS["S3->S4"][1],
  ]);
  // this uses the same geoRoute as i1
  const i2 = new Itinerary([
    CONNECTIONS["S1->S2"][0],
    CONNECTIONS["S2->S3"][0],
    CONNECTIONS["S3->S4"][0],
  ]);
  // this uses a different geoRoute
  const i3 = new Itinerary([CONNECTIONS["S1->S4"][0]]);

  // plan will be called when asking for alternative routes
  // @ts-ignore
  motis.plan.mockImplementation(() => [i1, i2, i3]);

  // here are our inputs
  const urlData = {
    from: "S1",
    to: "S4",
    date: DAY1,
    connectionIds: i1.connections.map((c) => c.id),
  };

  // @ts-ignore
  const components = mockComponents();
  await render(components, new Planner(), urlData);

  // all components are updated in this round
  expect(setURLState).not.toHaveBeenCalled();
  expect(components.config.updateView).toHaveBeenCalledWith("S1", "S4", DAY1);
  expect(components.perlschnur.updateView).toHaveBeenCalledWith([
    expect.objectContaining({ id: i1.connections[0].id.toString() }),
    expect.objectContaining({ id: i1.connections[1].id.toString() }),
    expect.objectContaining({ id: i1.connections[2].id.toString() }),
  ]);
  expect(components.calendar.updateView).toHaveBeenCalledWith(
    DAY1.toISODate(),
    [
      expect.objectContaining({
        id: CONNECTIONS["S1->S2"][0].id.toString(),
        status: "active",
      }),
      expect.objectContaining({
        id: CONNECTIONS["S1->S2"][1].id.toString(),
        status: "inactive",
      }),
      expect.objectContaining({
        id: CONNECTIONS["S1->S2"][2].id.toString(),
        status: "inactive",
      }),
      expect.objectContaining({
        id: CONNECTIONS["S2->S3"][0].id.toString(),
        status: "active",
      }),
      expect.objectContaining({
        id: CONNECTIONS["S3->S4"][1].id.toString(),
        status: "active",
      }),
      expect.objectContaining({
        id: CONNECTIONS["S3->S4"][0].id.toString(),
        status: "inactive",
      }),
    ],
  );
  expect(components.map.updateView).toHaveBeenCalledWith({
    edges: {
      "S1->S2": expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      "S2->S3": expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      "S3->S4": expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      "S1->S4": expect.objectContaining({
        featureState: expect.objectContaining({ isActive: false }),
      }),
    },
    stops: {
      S1: expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      S2: expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      S3: expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
      S4: expect.objectContaining({
        featureState: expect.objectContaining({ isActive: true }),
      }),
    },
  });
});
