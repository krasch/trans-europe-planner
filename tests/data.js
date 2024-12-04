const { initCityNameToId } = require("../script/components/componentData.js");
const { Connection } = require("../script/types/connection.js");
const { CustomDateTime } = require("../script/types/datetime.js");

const testCities = {
  1: { name: "City1", latitude: 10, longitude: 10, rank: 1 },
  2: { name: "City2", latitude: 20, longitude: 20, rank: 2 },
  3: {
    name: "City3",
    latitude: 30,
    longitude: 30,
    rank: 3,
    routesAvailable: true,
  },
  4: { name: "City4", latitude: 40, longitude: 40, rank: 4 },
  5: { name: "City5", latitude: 50, longitude: 50, rank: 5 },
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
    return String(id);
  }

  return increment;
}

const incrementalId = initIncrementalId();

function createConnection(stops) {
  const train = incrementalId();
  const date = stops[0][0];

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

  return new Connection(train, date, "test", "train", stopsEnriched);
}

initCityNameToId(testCities);

module.exports.testStations = testStations;
module.exports.testCities = testCities;
module.exports.createConnection = createConnection;
