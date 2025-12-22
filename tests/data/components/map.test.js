/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect } from "vitest";

import { prepareDataForMap } from "script/data/components/map.js";
import { Itinerary } from "script/types/itinerary.js";

import { connectionFromShorthand as _c } from "tests/_helpers/data.js";
import { getTestColor } from "tests/_helpers/data.js";
import { initTestDOM } from "tests/_helpers/domUtils.js";

beforeEach(async () => {
  initTestDOM(); // needed to get connection colors from css
});

function _color(idx) {
  return `rgb(${getTestColor(idx)})`;
}

test("prepareDataForMapEmpty", function () {
  const got = prepareDataForMap(null, []);

  expect(got).toStrictEqual({ cities: {}, edges: {}, itineraries: {} });
});

test("prepareDataForMapOneItineraryOneConnectionNotActive", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const got = prepareDataForMap(null, [i1]);

  const expCities = {
    C1: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
    C2: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
    C3: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
  };

  const expEdges = {
    "C1->C2": {
      isVisible: true,
      legs: ["C1->C3"],
      itineraries: ["C1->C3"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
    "C2->C3": {
      isVisible: true,
      legs: ["C1->C3"],
      itineraries: ["C1->C3"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
  };

  const expItineraries = {
    "C1->C3": {
      from: "City1",
      to: "City3",
      via: [],
      numTransfer: 0,
      travelTime: 119,
    },
  };

  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});

test("prepareDataForMapOneItineraryOneConnectionActive", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const got = prepareDataForMap(i1, []);

  const expCities = {
    C1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    C2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    C3: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
  };

  const expEdges = {
    "C1->C2": {
      isVisible: true,
      legs: ["C1->C3"],
      itineraries: ["C1->C3"],
      isActive: true,
      color: _color(0),
      activeLeg: "C1->C3",
      activeItinerary: "C1->C3",
    },
    "C2->C3": {
      isVisible: true,
      legs: ["C1->C3"],
      itineraries: ["C1->C3"],
      isActive: true,
      color: _color(0),
      activeLeg: "C1->C3",
      activeItinerary: "C1->C3",
    },
  };

  const expItineraries = {
    "C1->C3": {
      from: "City1",
      to: "City3",
      via: [],
      numTransfer: 0,
      travelTime: 119,
    },
  };

  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});

test("prepareDataForMapOneItineraryMultipleConnectionsActive", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c2 = _c("T2: S2@D1T14->S3@D1T15");
  const i1 = new Itinerary([c1, c2]);

  const got = prepareDataForMap(i1, []);

  const expCities = {
    C1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    C2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: true,
    },
    C3: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: false,
    },
  };

  const expEdges = {
    "C1->C2": {
      isVisible: true,
      legs: ["C1->C2"],
      itineraries: ["C1->C2->C3"],
      isActive: true,
      color: _color(0),
      activeLeg: "C1->C2",
      activeItinerary: "C1->C2->C3",
    },
    "C2->C3": {
      isVisible: true,
      legs: ["C2->C3"],
      itineraries: ["C1->C2->C3"],
      isActive: true,
      color: _color(1),
      activeLeg: "C2->C3",
      activeItinerary: "C1->C2->C3",
    },
  };

  const expItineraries = {
    "C1->C2->C3": {
      from: "City1",
      to: "City3",
      via: ["City2"],
      numTransfer: 1,
      travelTime: 299,
    },
  };

  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});

test("prepareDataForMapMultipleItineraryMultipleConnections", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S5@D1T12");
  const i1 = new Itinerary([c1]);

  const c2 = _c("T2: S1@D1T10->S2@D1T11");
  const c3 = _c("T3: S2@D1T12->S4@D1T14");
  const c4 = _c("T4: S4@D1T15->S5@D1T16");
  const i2 = new Itinerary([c2, c3, c4]);

  const got = prepareDataForMap(i2, [i1]);

  const expCities = {
    C1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    C2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: true,
    },
    C4: {
      isVisible: true,
      isStop: true,
      circleColor: _color(2),
      isTransfer: true,
    },
    C5: {
      isVisible: true,
      isStop: true,
      circleColor: _color(2),
      isTransfer: false,
    },
  };

  const expEdges = {
    "C1->C2": {
      isVisible: true,
      legs: ["C1->C5", "C1->C2"],
      itineraries: ["C1->C5", "C1->C2->C4->C5"],
      isActive: true,
      color: _color(0),
      activeLeg: "C1->C2",
      activeItinerary: "C1->C2->C4->C5",
    },
    "C2->C4": {
      isVisible: true,
      legs: ["C2->C4"],
      itineraries: ["C1->C2->C4->C5"],
      isActive: true,
      color: _color(1),
      activeLeg: "C2->C4",
      activeItinerary: "C1->C2->C4->C5",
    },
    "C2->C5": {
      isVisible: true,
      legs: ["C1->C5"],
      itineraries: ["C1->C5"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
    "C4->C5": {
      isVisible: true,
      legs: ["C4->C5"],
      itineraries: ["C1->C2->C4->C5"],
      isActive: true,
      color: _color(2),
      activeLeg: "C4->C5",
      activeItinerary: "C1->C2->C4->C5",
    },
  };

  const expItineraries = {
    "C1->C5": {
      from: "City1",
      to: "City5",
      via: [],
      numTransfer: 0,
      travelTime: 119,
    },
    "C1->C2->C4->C5": {
      from: "City1",
      to: "City5",
      via: ["City2", "City4"],
      numTransfer: 2,
      travelTime: 359,
    },
  };

  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});
