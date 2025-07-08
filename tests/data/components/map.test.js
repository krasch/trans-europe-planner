/**
 * @jest-environment jsdom
 */

import { prepareDataForMap } from "/script/data/components/map.js";
import { Itinerary } from "/script/types/itinerary.js";
import { ItineraryCollection } from "/script/types/itineraryCollection.js";

import { initTestDOM } from "/tests/_helpers/domUtils.js";
import { connectionFromShorthand as _c } from "/tests/_helpers/data.js";
import { getTestColor } from "/tests/_helpers/data.js";

beforeEach(async () => {
  initTestDOM(); // needed to get connection colors from css
});

function _color(idx) {
  return `rgb(${getTestColor(idx)})`;
}

test("prepareDataForMapEmpty", function () {
  const itineraries = new ItineraryCollection();

  const got = prepareDataForMap(itineraries);
  expect(got).toStrictEqual({ cities: {}, edges: {}, itineraries: {} });
});

test("prepareDataForMapOneItineraryOneConnectionNotActive", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const itineraries = new ItineraryCollection([i1]);

  const expCities = {
    S1: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
    S2: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
    S3: { isVisible: true, isStop: true, circleColor: null, isTransfer: false },
  };

  const expEdges = {
    "S1->S2": {
      isVisible: true,
      legs: ["S1->S3"],
      itineraries: ["S1->S3"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
    "S2->S3": {
      isVisible: true,
      legs: ["S1->S3"],
      itineraries: ["S1->S3"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
  };

  const expItineraries = {
    "S1->S3": {
      from: "S1",
      to: "S3",
      via: [],
      numTransfer: 0,
      travelTime: 120,
    },
  };

  const got = prepareDataForMap(itineraries);
  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});

test("prepareDataForMapOneItineraryOneConnectionActive", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const itineraries = new ItineraryCollection([i1]);
  itineraries.setActive(i1.id);

  const expCities = {
    S1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    S2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    S3: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
  };

  const expEdges = {
    "S1->S2": {
      isVisible: true,
      legs: ["S1->S3"],
      itineraries: ["S1->S3"],
      isActive: true,
      color: _color(0),
      activeLeg: "S1->S3",
      activeItinerary: "S1->S3",
    },
    "S2->S3": {
      isVisible: true,
      legs: ["S1->S3"],
      itineraries: ["S1->S3"],
      isActive: true,
      color: _color(0),
      activeLeg: "S1->S3",
      activeItinerary: "S1->S3",
    },
  };

  const expItineraries = {
    "S1->S3": {
      from: "S1",
      to: "S3",
      via: [],
      numTransfer: 0,
      travelTime: 120,
    },
  };

  const got = prepareDataForMap(itineraries);
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

  const itineraries = new ItineraryCollection([i1]);
  itineraries.setActive(i1.id);

  const expCities = {
    S1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    S2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: true,
    },
    S3: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: false,
    },
  };

  const expEdges = {
    "S1->S2": {
      isVisible: true,
      legs: ["S1->S2"],
      itineraries: ["S1->S2->S3"],
      isActive: true,
      color: _color(0),
      activeLeg: "S1->S2",
      activeItinerary: "S1->S2->S3",
    },
    "S2->S3": {
      isVisible: true,
      legs: ["S2->S3"],
      itineraries: ["S1->S2->S3"],
      isActive: true,
      color: _color(1),
      activeLeg: "S2->S3",
      activeItinerary: "S1->S2->S3",
    },
  };

  const expItineraries = {
    "S1->S2->S3": {
      from: "S1",
      to: "S3",
      via: ["S2"],
      numTransfer: 1,
      travelTime: 300,
    },
  };

  const got = prepareDataForMap(itineraries);
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

  const itineraries = new ItineraryCollection([i1, i2]);
  itineraries.setActive(i2.id);

  const expCities = {
    S1: {
      isVisible: true,
      isStop: true,
      circleColor: _color(0),
      isTransfer: false,
    },
    S2: {
      isVisible: true,
      isStop: true,
      circleColor: _color(1),
      isTransfer: true,
    },
    S4: {
      isVisible: true,
      isStop: true,
      circleColor: _color(2),
      isTransfer: true,
    },
    S5: {
      isVisible: true,
      isStop: true,
      circleColor: _color(2),
      isTransfer: false,
    },
  };

  const expEdges = {
    "S1->S2": {
      isVisible: true,
      legs: ["S1->S5", "S1->S2"],
      itineraries: ["S1->S5", "S1->S2->S4->S5"],
      isActive: true,
      color: _color(0),
      activeLeg: "S1->S2",
      activeItinerary: "S1->S2->S4->S5",
    },
    "S2->S4": {
      isVisible: true,
      legs: ["S2->S4"],
      itineraries: ["S1->S2->S4->S5"],
      isActive: true,
      color: _color(1),
      activeLeg: "S2->S4",
      activeItinerary: "S1->S2->S4->S5",
    },
    "S2->S5": {
      isVisible: true,
      legs: ["S1->S5"],
      itineraries: ["S1->S5"],
      isActive: false,
      color: null,
      activeLeg: null,
      activeItinerary: null,
    },
    "S4->S5": {
      isVisible: true,
      legs: ["S4->S5"],
      itineraries: ["S1->S2->S4->S5"],
      isActive: true,
      color: _color(2),
      activeLeg: "S4->S5",
      activeItinerary: "S1->S2->S4->S5",
    },
  };

  const expItineraries = {
    "S1->S5": {
      from: "S1",
      to: "S5",
      via: [],
      numTransfer: 0,
      travelTime: 120,
    },
    "S1->S2->S4->S5": {
      from: "S1",
      to: "S5",
      via: ["S2", "S4"],
      numTransfer: 2,
      travelTime: 360,
    },
  };

  const got = prepareDataForMap(itineraries);
  expect(got).toEqual({
    cities: expCities,
    edges: expEdges,
    itineraries: expItineraries,
  });
});
