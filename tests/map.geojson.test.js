const { Leg, City, Coordinates } = require("../script/types.js");
const { cityToGeojson, legToGeojson } = require("../script/map.js");

test("cityToGeojson", function () {
  const coordinates = new Coordinates(10, 20);
  const city = new City("mycity", coordinates);

  const expected = {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [coordinates.longitude, coordinates.latitude],
    },
    properties: { name: city.name, id: city.name },
  };

  expect(JSON.stringify(cityToGeojson(city))).toBe(JSON.stringify(expected));
});

test("legToGeojson", function () {
  const coordinatesCityA = new Coordinates(10, 20);
  const coordinatesCityB = new Coordinates(-30, -40);

  const cityA = new City("A", coordinatesCityA);
  const cityB = new City("B", coordinatesCityB);

  const leg = new Leg(cityA, cityB);

  const expected = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [coordinatesCityA.longitude, coordinatesCityA.latitude],
        [coordinatesCityB.longitude, coordinatesCityB.latitude],
      ],
    },
    properties: { id: `${cityA.name}-${cityB.name}` },
  };

  expect(JSON.stringify(legToGeojson(leg))).toBe(JSON.stringify(expected));
});
