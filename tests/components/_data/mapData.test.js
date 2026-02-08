import { test, expect, vi } from "vitest";

import { prepareDataForMap } from "app/components/_data/map.js";

import { itineraryFromShortHand as _i } from "tests/_helpers/data.js";
import { TEST_COLORS } from "tests/_helpers/data.js";

vi.mock("app/assets.js", () => {
  return {
    getColor: (idx) => TEST_COLORS[idx],
    getIcon: (mode) => `${mode}.svg`,
    GREY: "#aaa",
  };
});

test("One itinerary with one connection", function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11->S3@D1T12"]);
  const got = prepareDataForMap(i1, []);

  const expStops = {
    S1: {
      featureState: {
        isActive: true,
        isStart: true,
        isDestination: false,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[0]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [10.0, 10.0],
        },
        properties: {
          id: "S1",
          name: "Stop1",
        },
      },
    },
    S2: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: false,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[0]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [20.0, 20.0],
        },
        properties: {
          id: "S2",
          name: "Stop2",
        },
      },
    },
    S3: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: true,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[0]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [30.0, 30.0],
        },
        properties: {
          id: "S3",
          name: "Stop3",
        },
      },
    },
  };

  const expEdges = {
    "S1->S2": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[0]})`,
        connectionId: i1.connections[0].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [10.0, 10.0],
            [20.0, 20.0],
          ],
        },
        properties: { id: "S1->S2" },
      },
    },
    "S2->S3": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[0]})`,
        connectionId: i1.connections[0].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [20.0, 20.0],
            [30.0, 30.0],
          ],
        },
        properties: { id: "S2->S3" },
      },
    },
  };

  expect(got).toEqual({
    stops: expStops,
    edges: expEdges,
  });
});

test("One itinerary with multiple connections", function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11", "T2: S2@D1T12->S3@D1T14"]);
  const got = prepareDataForMap(i1, []);

  const expStops = {
    S1: {
      featureState: {
        isActive: true,
        isStart: true,
        isDestination: false,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[0]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [10.0, 10.0],
        },
        properties: {
          id: "S1",
          name: "Stop1",
        },
      },
    },
    S2: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: false,
        isTransfer: true,
        color: `rgb(${TEST_COLORS[1]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [20.0, 20.0],
        },
        properties: {
          id: "S2",
          name: "Stop2",
        },
      },
    },
    S3: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: true,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[1]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [30.0, 30.0],
        },
        properties: {
          id: "S3",
          name: "Stop3",
        },
      },
    },
  };

  const expEdges = {
    "S1->S2": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[0]})`,
        connectionId: i1.connections[0].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [10.0, 10.0],
            [20.0, 20.0],
          ],
        },
        properties: { id: "S1->S2" },
      },
    },
    "S2->S3": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[1]})`,
        connectionId: i1.connections[1].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [20.0, 20.0],
            [30.0, 30.0],
          ],
        },
        properties: { id: "S2->S3" },
      },
    },
  };

  expect(got).toEqual({
    stops: expStops,
    edges: expEdges,
  });
});

test("Multiple itineraries with multiple connections", function () {
  // S1->S4 via S2, S3
  const i1 = _i([
    "T1: S1@D1T10->S2@D1T11",
    "T2: S2@D1T12->S3@D1T14",
    "T3: S3@D1T15->S4@D1T16",
  ]);
  // S1->S4 direct
  const i2 = _i(["T4: S1@D1T10->S3@D1T11->S4@D1T14"]);
  // S1->S4 via S2, S5
  const i3 = _i([
    "T5: S1@D1T10->S2@D1T11",
    "T6: S2@D1T12->S5@D1T14",
    "T7: S5@D1T15->S4@D1T16",
  ]);
  const got = prepareDataForMap(i1, [i2, i3]);

  const expStops = {
    S1: {
      featureState: {
        isActive: true,
        isStart: true,
        isDestination: false,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[0]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [10.0, 10.0],
        },
        properties: {
          id: "S1",
          name: "Stop1",
        },
      },
    },
    S2: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: false,
        isTransfer: true,
        color: `rgb(${TEST_COLORS[1]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [20.0, 20.0],
        },
        properties: {
          id: "S2",
          name: "Stop2",
        },
      },
    },
    S3: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: false,
        isTransfer: true,
        color: `rgb(${TEST_COLORS[2]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [30.0, 30.0],
        },
        properties: {
          id: "S3",
          name: "Stop3",
        },
      },
    },
    S4: {
      featureState: {
        isActive: true,
        isStart: false,
        isDestination: true,
        isTransfer: false,
        color: `rgb(${TEST_COLORS[2]})`,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [40.0, 40.0],
        },
        properties: {
          id: "S4",
          name: "Stop4",
        },
      },
    },
    S5: {
      featureState: {
        isActive: false,
        isStart: false,
        isDestination: false,
        isTransfer: true,
        color: "#aaa",
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [50.0, 50.0],
        },
        properties: {
          id: "S5",
          name: "Stop5",
        },
      },
    },
  };

  const expEdges = {
    "S1->S2": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[0]})`,
        connectionId: i1.connections[0].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [10.0, 10.0],
            [20.0, 20.0],
          ],
        },
        properties: { id: "S1->S2" },
      },
    },
    "S2->S3": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[1]})`,
        connectionId: i1.connections[1].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [20.0, 20.0],
            [30.0, 30.0],
          ],
        },
        properties: { id: "S2->S3" },
      },
    },
    "S3->S4": {
      featureState: {
        isActive: true,
        color: `rgb(${TEST_COLORS[2]})`,
        connectionId: i1.connections[2].id,
        itineraryId: i1.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [30.0, 30.0],
            [40.0, 40.0],
          ],
        },
        properties: { id: "S3->S4" },
      },
    },
    "S1->S3": {
      featureState: {
        isActive: false,
        color: "#aaa",
        connectionId: i2.connections[0].id,
        itineraryId: i2.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [10.0, 10.0],
            [30.0, 30.0],
          ],
        },
        properties: { id: "S1->S3" },
      },
    },
    "S2->S5": {
      featureState: {
        isActive: false,
        color: "#aaa",
        connectionId: i3.connections[1].id,
        itineraryId: i3.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [20.0, 20.0],
            [50.0, 50.0],
          ],
        },
        properties: { id: "S2->S5" },
      },
    },
    "S4->S5": {
      featureState: {
        isActive: false,
        color: "#aaa",
        connectionId: i3.connections[2].id,
        itineraryId: i3.id,
      },
      geoJSON: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [40.0, 40.0],
            [50.0, 50.0],
          ],
        },
        properties: { id: "S4->S5" },
      },
    },
  };

  expect(got).toEqual({
    stops: expStops,
    edges: expEdges,
  });
});
