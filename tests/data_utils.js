const { Coordinates, City, Station } = require("../script/types.js");
const { CustomDateTime } = require("../script/util.js");
const types = require("../script/types.js");

function getRandomCoordinates() {
  const latitude = Math.floor(Math.random() * 80) + 1; // avoid 0
  const longitude = Math.floor(Math.random() * 170) + 1;
  return new Coordinates(latitude, longitude);
}

function createCity(name) {
  return new City(name, getRandomCoordinates());
}

function createStation(id, name, city) {
  return new Station(id, name, getRandomCoordinates(), city);
}

function createConnection(baseId, startStation, endStation) {
  return new types.Connection(baseId, baseId, "train", [
    {
      station: startStation,
      datetime: new CustomDateTime("2024-10-14", "12:32"),
    },
    {
      station: endStation,
      datetime: new CustomDateTime("2024-10-14", "14:03"),
    },
  ]);
}

const cityA = createCity("A");
const cityB = createCity("B");
const cityC = createCity("C");
const cityD = createCity("D");

const stationA = createStation("A", "A Main station", cityA);
const stationAOther = createStation("A", "A other station", cityA);
const stationB = createStation("B", "B Main station", cityB);
const stationC = createStation("C", "C Main station", cityC);
const stationD = createStation("D", "D Main station", cityD);

module.exports.createCity = createCity;
module.exports.createStation = createStation;
module.exports.createConnection = createConnection;
module.exports.DATA = {
  cityA: cityA,
  cityB: cityB,
  cityC: cityC,
  cityD: cityD,
  stationA: stationA,
  stationAOther: stationAOther,
  stationB: stationB,
  stationC: stationC,
  stationD: stationD,
};
