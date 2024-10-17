const { CustomDateTime } = require("../script/util.js");

const testCities = {
  1: { name: "City1", latitude: 10, longitude: 10 },
  2: { name: "City2", latitude: 20, longitude: 20 },
  3: { name: "City3", latitude: 30, longitude: 30 },
  4: { name: "City4", latitude: 40, longitude: 40 },
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

function createConnection(stations, startHour) {
  // because of the time handling below
  if (stations.length > 5)
    throw Error("Can not generate such long connections");

  if (!startHour) startHour = 14;

  const stops = [];

  for (let i in stations) {
    if (!testStations[stations[i]])
      throw new Error(`Unknown test station ${stations[i]}`);

    // always 10 minutes between stops, departure 1 min after arrival
    const arrival = String(i * 10).padStart(2, "0");
    const departure = String(i * 10 + 1).padStart(2, "0");

    stops.push({
      station: stations[i],
      arrival: new CustomDateTime("2024-10-15", `${startHour}:${arrival}:00`),
      departure: new CustomDateTime(
        "2024-10-15",
        `${startHour}:${departure}:00`,
      ),
    });
  }

  delete stops[0]["arrival"];
  delete stops.at(-1)["departure"];

  return {
    id: `2024-10-15X${incrementalId()}`,
    type: "train",
    stops: stops,
  };
}

module.exports.testStations = testStations;
module.exports.testCities = testCities;
module.exports.createConnection = createConnection;
