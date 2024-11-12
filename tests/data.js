const { CustomDateTime } = require("../script/util.js");
const { Connection } = require("../script/database.js");

const testCities = {
  1: { name: "City1", latitude: 10, longitude: 10 },
  2: { name: "City2", latitude: 20, longitude: 20 },
  3: { name: "City3", latitude: 30, longitude: 30 },
  4: { name: "City4", latitude: 40, longitude: 40 },
  5: { name: "City5", latitude: 50, longitude: 50 },
};

const testStations = {
  city1MainStationId: {
    name: "City 1 Main Station",
    city: 1,
    preferred: true,
  },
  city1ExtraStationId: {
    name: "City 1 Extra Station",
    city: 1,
    preferred: false,
  },
  city2MainStationId: {
    name: "City 2 Main Station",
    city: 2,
    preferred: true,
  },
  city3MainStationId: {
    name: "City 3 Main Station",
    city: 3,
    preferred: true,
  },
  city3ExtraStationId: {
    name: "City 3 Extra Station",
    city: 3,
    preferred: false,
  },
  city4MainStationId: {
    name: "City 4 Main Station",
    city: 4,
    preferred: true,
  },
  city5MainStationId: {
    name: "City 5 Main Station",
    city: 5,
    preferred: true,
  },
};

function initIncrementalId() {
  let id = 0;

  function increment() {
    id += 1;
    return id;
  }

  return increment;
}

const incrementalId = initIncrementalId();

function createConnection(stops) {
  const date = stops[0][0];
  const id = `${incrementalId()}XXX${date}`;

  const stopsEnriched = [];
  for (let [date, time, stationId] of stops) {
    stopsEnriched.push({
      arrival: new CustomDateTime(date, time + ":00"),
      departure: new CustomDateTime(date, time + ":00"),
      stationId: stationId,
      stationName: testStations[stationId].name,
      stationIsPreferred: testStations[stationId].preferred,
      cityId: testStations[stationId].city,
      cityName: testCities[testStations[stationId].city].name,
    });
  }

  return new Connection(id, "test", "train", stopsEnriched);
}

module.exports.testStations = testStations;
module.exports.testCities = testCities;
module.exports.createConnection = createConnection;
