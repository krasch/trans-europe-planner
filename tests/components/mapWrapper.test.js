/**
 * @vitest-environment jsdom
 */
// @ts-nocheck
import { test as baseTest, expect, vi } from "vitest";

import { MapWrapper } from "script/components/map.js";

const mockSources = {
  edges: { setData: vi.fn() },
  stops: { setData: vi.fn() },
};

const mockMap = {
  _container: { style: { attribute: null } },
  on: vi.fn(),
  resize: vi.fn(),
  addSource: vi.fn(),
  addLayer: vi.fn(),
  getSource: (name) => mockSources[name],
  setFeatureState: vi.fn(),
};

const test = baseTest.extend({
  mapWrapper: async ({}, use) => {
    vi.mock("script/components/mapImport.js", () => ({
      maplibre: { Map: vi.fn(() => mockMap) },
    }));

    const container = document.createElement("div");
    container.id = "map";

    const mapWrapper = new MapWrapper("map", [11, 54], 5);
    const onLoadTrigger = mockMap.on.mock.calls[0][1];
    onLoadTrigger();

    await use(mapWrapper); // test runs here

    vi.restoreAllMocks();
  },
});

function edge(id, connectionId = "c1", itineraryId = "i1") {
  return {
    geoJSON: `geojson_edge${id}`,
    featureState: {
      connectionId: connectionId,
      itineraryId: itineraryId,
      key: `value${id}`,
    },
  };
}

function stop(id) {
  return {
    geoJSON: `geojson_stop${id}`,
    featureState: { key: `value${id}` },
  };
}

function fs(id, source, state) {
  return [{ id: id, source: source }, state];
}

test("first update sets all data", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);

  expect(mockSources.stops.setData).toHaveBeenCalledWith({
    type: "FeatureCollection",
    features: [
      data.stops.s1.geoJSON,
      data.stops.s2.geoJSON,
      data.stops.s3.geoJSON,
    ],
  });

  expect(mockSources.edges.setData).toHaveBeenCalledWith({
    type: "FeatureCollection",
    features: [data.edges.e1.geoJSON, data.edges.e2.geoJSON],
  });

  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("s1", "stops", data.stops.s1.featureState),
    fs("s2", "stops", data.stops.s2.featureState),
    fs("s3", "stops", data.stops.s3.featureState),
    fs("e1", "edges", data.edges.e1.featureState),
    fs("e2", "edges", data.edges.e2.featureState),
  ]);
});

test("second update also sets all data", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);

  vi.resetAllMocks();
  await mapWrapper.updateView(data);

  expect(mockSources.stops.setData).toHaveBeenCalledWith({
    type: "FeatureCollection",
    features: [
      data.stops.s1.geoJSON,
      data.stops.s2.geoJSON,
      data.stops.s3.geoJSON,
    ],
  });

  expect(mockSources.edges.setData).toHaveBeenCalledWith({
    type: "FeatureCollection",
    features: [data.edges.e1.geoJSON, data.edges.e2.geoJSON],
  });

  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("s1", "stops", data.stops.s1.featureState),
    fs("s2", "stops", data.stops.s2.featureState),
    fs("s3", "stops", data.stops.s3.featureState),
    fs("e1", "edges", data.edges.e1.featureState),
    fs("e2", "edges", data.edges.e2.featureState),
  ]);
});

test("set stop hover", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);

  // hovering invalid stop should just be ignored
  vi.resetAllMocks();
  mapWrapper.setStopHover("s7", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([]);

  // hover on
  vi.resetAllMocks();
  mapWrapper.setStopHover("s2", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("s2", "stops", { ...data.stops.s2.featureState, isHover: true }),
  ]);

  // hover off
  vi.resetAllMocks();
  mapWrapper.setStopHover("s2", false);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("s2", "stops", { ...data.stops.s2.featureState, isHover: false }),
  ]);
});

test("set connection hover", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1", "c1"), e2: edge("e2", "c2"), e3: edge("e3", "c1") },
  };
  await mapWrapper.updateView(data);

  // hovering invalid connection should just be ignored
  vi.resetAllMocks();
  mapWrapper.setConnectionHover("c5", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([]);

  // hover on
  vi.resetAllMocks();
  mapWrapper.setConnectionHover("c1", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("e1", "edges", { ...data.edges.e1.featureState, isHover: true }),
    fs("e3", "edges", { ...data.edges.e3.featureState, isHover: true }),
  ]);

  // hover off
  vi.resetAllMocks();
  mapWrapper.setConnectionHover("c1", false);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("e1", "edges", { ...data.edges.e1.featureState, isHover: false }),
    fs("e3", "edges", { ...data.edges.e3.featureState, isHover: false }),
  ]);
});

test("set itinerary hover", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: {
      e1: edge("e1", "c1", "i1"),
      e2: edge("e2", "c2", "i2"),
      e3: edge("e3", "c2", "i2"),
    },
  };
  await mapWrapper.updateView(data);

  // hovering invalid itinerary should just be ignored
  vi.resetAllMocks();
  mapWrapper.setItineraryHover("i3", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([]);

  // hover on
  vi.resetAllMocks();
  mapWrapper.setItineraryHover("i2", true);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("e2", "edges", { ...data.edges.e2.featureState, isHover: true }),
    fs("e3", "edges", { ...data.edges.e3.featureState, isHover: true }),
  ]);

  // hover off
  vi.resetAllMocks();
  mapWrapper.setItineraryHover("i2", false);
  expect(mockMap.setFeatureState.mock.calls).toStrictEqual([
    fs("e2", "edges", { ...data.edges.e2.featureState, isHover: false }),
    fs("e3", "edges", { ...data.edges.e3.featureState, isHover: false }),
  ]);
});
