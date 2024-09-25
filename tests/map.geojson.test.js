const { Station, City, Coordinates } = require("../script/types.js");
const { createConnection } = require("../tests/util.js");
const { cityToGeojson, connectionToGeojson } = require("../script/map.js");

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

  const coordinatesStationA = new Coordinates(0, 0);
  const coordinatesStationB = new Coordinates(10, 10);

  const stationA = new Station(1, "A Hbf", coordinatesStationA, cityA);
  const stationB = new Station(2, "A Hbf", coordinatesStationB, cityB);

  const connection = createConnection(1, stationA, stationB);

  const expected = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        // should be coordinates of city, not of station
        [coordinatesCityA.longitude, coordinatesCityA.latitude],
        [coordinatesCityB.longitude, coordinatesCityB.latitude],
      ],
    },
    // should be referencing city, not station
    properties: { id: `${cityA.name}-${cityB.name}` },
  };

  expect(JSON.stringify(connectionToGeojson(connection))).toBe(
    JSON.stringify(expected),
  );
});
