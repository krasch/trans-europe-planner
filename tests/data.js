const { CustomDateTime } = require("../script/util.js");
const { Database } = require("../script/database.js");

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

function createConnection(stations, startHour, startDay) {
  // because of the time handling below
  if (stations.length > 5)
    throw Error("Can not generate such long connections");

  if (!startHour) startHour = 14;
  if (!startDay) startDay = "2024-10-15";

  const stops = [];

  for (let i in stations) {
    if (!testStations[stations[i]])
      throw new Error(`Unknown test station ${stations[i]}`);

    // always 10 minutes between stops, departure 1 min after arrival
    const arrival = String(i * 10).padStart(2, "0");
    const departure = String(i * 10 + 1).padStart(2, "0");

    stops.push({
      station: stations[i],
      arrival: new CustomDateTime(startDay, `${startHour}:${arrival}:00`),
      departure: new CustomDateTime(startDay, `${startHour}:${departure}:00`),
    });
  }

  delete stops[0]["arrival"];
  delete stops.at(-1)["departure"];

  return {
    id: `${startDay}X${incrementalId()}`,
    type: "train",
    stops: stops,
  };
}

const testConnections = {
  // City1 <-> City2
  "City1 (6:01) -> City2 (6:10) on Day 1": createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6,
    "2024-10-15",
  ),
  "City1 (7:01) -> City2 (7:10) on Day 1": createConnection(
    ["city1MainStationId", "city2MainStationId"],
    7,
    "2024-10-15",
  ),
  "City1 (6:01) -> City2 (6:10) on Day 2": createConnection(
    ["city1MainStationId", "city2MainStationId"],
    6,
    "2024-10-16",
  ),
  "City2 (9:01) -> City1 (9:10) on Day 1": createConnection(
    ["city2MainStationId", "city1MainStationId"],
    9,
    "2024-10-15",
  ),
  "City1 (9:01) -> City3 (9:10) on Day 2": createConnection(
    ["city1MainStationId", "city3MainStationId"],
    9,
    "2024-10-16",
  ),
  // City2 <-> City3
  "City2 (7:01) -> City3 (7:10) on Day 1": createConnection(
    ["city2MainStationId", "city3MainStationId"],
    7,
    "2024-10-15",
  ),
  "City2 (8:01) -> City3 (8:10) on Day 1": createConnection(
    ["city2MainStationId", "city3MainStationId"],
    8,
    "2024-10-15",
  ),
  "City2 (8:01) -> City3 (8:10) on Day 2": createConnection(
    ["city2MainStationId", "city3MainStationId"],
    8,
    "2024-10-16",
  ),
  // City3 <-> City4
  "City3 (6:01) -> City4 (6:10) on Day 3": createConnection(
    ["city3MainStationId", "city4MainStationId"],
    6,
    "2024-10-17",
  ),
};

function createDatabase(connectionNames) {
  const connections = [];
  for (let name of connectionNames) {
    if (!testConnections[name])
      throw new Error(`Unknown test connection ${name}`);
    connections.push(testConnections[name]);
  }
  return new Database(testCities, testStations, connections);
}

module.exports.testStations = testStations;
module.exports.testCities = testCities;
module.exports.testConnections = testConnections;
module.exports.createConnection = createConnection;
module.exports.createDatabase = createDatabase;
