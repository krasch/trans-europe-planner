const { Leg, City, Coordinates } = require("../script/types.js");
const { cityToGeojson, legToGeojson } = require("../script/map.js");

test("cityToGeojson", function () {
  const coordinates = new Coordinates(10, 20);
  const city = new City("mycity", coordinates);

  const expected = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [20, 10],
    },
    properties: { name: "mycity" },
  };

  expect(JSON.stringify(cityToGeojson(city))).toBe(JSON.stringify(expected));
});

test("legToGeojson", function () {
  const coordinatesA = new Coordinates(10, 20);
  const coordinatesB = new Coordinates(-30, -40);

  const cityA = new City("A", coordinatesA);
  const cityB = new City("B", coordinatesB);

  const leg = new Leg(cityA, cityB);

  const expected = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [20, 10],
        [-40, -30],
      ],
    },
    properties: { name: "A -> B" },
    id: leg.numericId,
  };

  expect(JSON.stringify(legToGeojson(leg))).toBe(JSON.stringify(expected));
});
