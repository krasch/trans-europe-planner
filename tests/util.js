const { Coordinates, City, Station } = require("../script/types.js");
const types = require("../script/types.js");

function getRandomCoordinates() {
  const latitude = Math.floor(Math.random() * 80) + 1; // avoid 0
  const longitude = Math.floor(Math.random() * 170) + 1;
  return new Coordinates(latitude, longitude);
}

function createCity(name) {
  return new City(name, getRandomCoordinates());
}

function createStation(id, city) {
  return new Station(
    id,
    `${city.name} main station`,
    getRandomCoordinates(),
    city,
  );
}

function createConnection(id, startStation, endStation) {
  return new types.Connection(id, id, "train", new Date("2024-10-14"), [
    { station: startStation, time: "12:32" },
    { station: endStation, time: "14:03" },
  ]);
}

module.exports.createCity = createCity;
module.exports.createStation = createStation;
module.exports.createConnection = createConnection;
