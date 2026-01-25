// @ts-nocheck
import { test as baseTest, expect } from "vitest";

import { MapWrapper } from "script/components/map.js";

import { timeout } from "tests/_helpers/domUtils.js";

const test = baseTest.extend({
  mapWrapper: async ({}, use) => {
    const container = document.createElement("div");
    container.id = "map";
    document.body.innerHTML = "";
    document.body.appendChild(container);

    const testStyle = "tests/_resources/emptyMapStyle.json";
    const mapWrapper = new MapWrapper("map", [11, 54], 5, testStyle);
    await mapWrapper.mapReady;

    // utility function to get feature state for multiple ids
    mapWrapper.featureState = (source, ids) =>
      ids.map((id) =>
        mapWrapper.map.getFeatureState({ source: source, id: id }),
      );

    // utility function to get source data
    mapWrapper.sourceData = async (source) => {
      const data = await mapWrapper.map.getSource(source).getData();
      return data["features"];
    };

    // test runs here
    await use(mapWrapper);

    document.body.innerHTML = "";
  },
});

function stop(id) {
  return {
    geoJSON: { type: "Feature", properties: { id: id } },
    featureState: { key1: `value1${id}`, key2: `value2${id}` },
  };
}

function edge(id, connectionId = "c1", itineraryId = "i1") {
  return {
    geoJSON: { type: "Feature", properties: { id: id } },
    featureState: {
      connectionId: connectionId,
      itineraryId: itineraryId,
      key3: `value3${id}`,
      key4: `value4${id}`,
    },
  };
}

test("first update sets all data", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);
  await timeout(30);

  await expect(mapWrapper.sourceData("stops")).resolves.toStrictEqual([
    data.stops.s1.geoJSON,
    data.stops.s2.geoJSON,
    data.stops.s3.geoJSON,
  ]);

  await expect(mapWrapper.sourceData("edges")).resolves.toStrictEqual([
    data.edges.e1.geoJSON,
    data.edges.e2.geoJSON,
  ]);

  expect(mapWrapper.featureState("stops", ["s1", "s2", "s3"])).toStrictEqual([
    data.stops.s1.featureState,
    data.stops.s2.featureState,
    data.stops.s3.featureState,
  ]);

  expect(mapWrapper.featureState("edges", ["e1", "e2"])).toStrictEqual([
    data.edges.e1.featureState,
    data.edges.e2.featureState,
  ]);
});

test("Removing items removes them from source data", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);
  await timeout(30);

  const newData = {
    stops: { s1: stop("s1"), s3: stop("s3") },
    edges: { e2: edge("e2") },
  };
  await mapWrapper.updateView(newData);
  await timeout(30);

  await expect(mapWrapper.sourceData("stops")).resolves.toStrictEqual([
    newData.stops.s1.geoJSON,
    newData.stops.s3.geoJSON,
  ]);

  await expect(mapWrapper.sourceData("edges")).resolves.toStrictEqual([
    newData.edges.e2.geoJSON,
  ]);

  expect(mapWrapper.featureState("stops", ["s1", "s2", "s3"])).toStrictEqual([
    newData.stops.s1.featureState,
    data.stops.s2.featureState, // todo sic still exists
    newData.stops.s3.featureState,
  ]);

  expect(mapWrapper.featureState("edges", ["e1", "e2"])).toStrictEqual([
    data.edges.e1.featureState, // todo sic still exists
    newData.edges.e2.featureState,
  ]);
});

test("Changes in feature state get reflected", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);
  await timeout(30);

  const newData = JSON.parse(JSON.stringify(data)); // copy

  // updates: some deletes, some changes, some adds
  delete newData.stops.s1.featureState.key1;
  delete newData.edges.e1.featureState.key3;
  newData.stops.s2.featureState.key2 = "green";
  newData.edges.e1.featureState.key4 = "orange";
  newData.stops.s3.featureState.keyNew = "1233";
  newData.edges.e2.featureState.keyNew = "ABCD";

  await mapWrapper.updateView(newData);
  await timeout(30);

  expect(mapWrapper.featureState("stops", ["s1", "s2", "s3"])).toStrictEqual([
    newData.stops.s1.featureState,
    newData.stops.s2.featureState,
    newData.stops.s3.featureState,
  ]);

  expect(mapWrapper.featureState("edges", ["e1", "e2"])).toStrictEqual([
    newData.edges.e1.featureState,
    newData.edges.e2.featureState,
  ]);
});

test("set stop hover", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1"), e2: edge("e2") },
  };
  await mapWrapper.updateView(data);
  await timeout(30);

  // hovering invalid stop should just not throw an error
  mapWrapper.setStopHover("s7", true);

  // hover on
  mapWrapper.setStopHover("s2", true);
  expect(mapWrapper.featureState("stops", ["s1", "s2", "s3"])).toStrictEqual([
    data.stops.s1.featureState,
    { ...data.stops.s2.featureState, isHover: true },
    data.stops.s3.featureState,
  ]);

  // hover off
  mapWrapper.setStopHover("s2", false);
  expect(mapWrapper.featureState("stops", ["s1", "s2", "s3"])).toStrictEqual([
    data.stops.s1.featureState,
    { ...data.stops.s2.featureState, isHover: false },
    data.stops.s3.featureState,
  ]);
});

test("set connection hover", async ({ mapWrapper }) => {
  const data = {
    stops: { s1: stop("s1"), s2: stop("s2"), s3: stop("s3") },
    edges: { e1: edge("e1", "c1"), e2: edge("e2", "c2"), e3: edge("e3", "c1") },
  };
  await mapWrapper.updateView(data);
  await timeout(30);

  // hovering invalid connection should not throw an error
  mapWrapper.setConnectionHover("c5", true);

  // hover on
  mapWrapper.setConnectionHover("c1", true);
  expect(mapWrapper.featureState("edges", ["e1", "e2", "e3"])).toStrictEqual([
    { ...data.edges.e1.featureState, isHover: true },
    data.edges.e2.featureState,
    { ...data.edges.e3.featureState, isHover: true },
  ]);

  // hover off
  mapWrapper.setConnectionHover("c1", false);
  expect(mapWrapper.featureState("edges", ["e1", "e2", "e3"])).toStrictEqual([
    { ...data.edges.e1.featureState, isHover: false },
    data.edges.e2.featureState,
    { ...data.edges.e3.featureState, isHover: false },
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

  // hovering invalid itinerary should not throw an erro
  mapWrapper.setItineraryHover("i3", true);

  // hover on
  mapWrapper.setItineraryHover("i2", true);
  expect(mapWrapper.featureState("edges", ["e1", "e2", "e3"])).toStrictEqual([
    data.edges.e1.featureState,
    { ...data.edges.e2.featureState, isHover: true },
    { ...data.edges.e3.featureState, isHover: true },
  ]);

  // hover off
  mapWrapper.setItineraryHover("i2", false);
  expect(mapWrapper.featureState("edges", ["e1", "e2", "e3"])).toStrictEqual([
    data.edges.e1.featureState,
    { ...data.edges.e2.featureState, isHover: false },
    { ...data.edges.e3.featureState, isHover: false },
  ]);
});
