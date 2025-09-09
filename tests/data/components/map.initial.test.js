import { prepareInitialDataForMap } from "script/data/components/map.js";

test("prepareInitialDataForMap", function () {
  const cities = [
    { id: "C1", name: "City1", lngLat: [10, 10] },
    { id: "C2", name: "City2", lngLat: [20, 20], isDestination: true },
    { id: "C3", name: "City3", lngLat: [30, 30] },
  ];

  const expCities = {
    geo: {
      C1: { name: "City1", lngLat: [10, 10] },
      C2: { name: "City2", lngLat: [20, 20] },
      C3: { name: "City3", lngLat: [30, 30] },
    },
    defaults: {
      C1: { rank: 1, isDestination: false, isHome: false, isVisible: false },
      C2: { rank: 2, isDestination: true, isHome: false, isVisible: true },
      C3: { rank: 1, isDestination: false, isHome: true, isVisible: true },
    },
  };

  const expEdges = {
    geo: {
      "C1->C2": { startLngLat: [10, 10], endLngLat: [20, 20] },
      "C1->C3": { startLngLat: [10, 10], endLngLat: [30, 30] },
      "C2->C3": { startLngLat: [20, 20], endLngLat: [30, 30] },
    },
    defaults: {
      "C1->C2": { isVisible: false },
      "C1->C3": { isVisible: false },
      "C2->C3": { isVisible: false },
    },
  };

  const got = prepareInitialDataForMap("C3", cities);
  expect(got).toStrictEqual([expCities, expEdges]);
});
