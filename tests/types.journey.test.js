const types = require("../script/types.js");

function getRandomCoordinates() {
  const latitude = Math.floor(Math.random() * 80) + 1; // avoid 0
  const longitude = Math.floor(Math.random() * 170) + 1;
  return new types.Coordinates(latitude, longitude);
}

function createStation(baseName) {
  return new types.Station(
    `${baseName} main station`,
    getRandomCoordinates(),
    new types.City(baseName, getRandomCoordinates()),
  );
}

function createConnection(startStation, endStation) {
  return new types.Connection(
    "someId",
    "someDisplayId",
    "train",
    new Date("2024-10-14"),
    [
      { station: startStation, time: "12:32" },
      { station: endStation, time: "14:03" },
    ],
  );
}

test("journeyWithOneConnection", function () {
  const stationA = createStation("A");
  const stationB = createStation("B");

  const connection = createConnection(stationA, stationB);
  const journey = new types.Journey([connection]);
  expect(journey.stopovers).toStrictEqual([stationA.city, stationB.city]);
});

test("journeyWithMultipleConnection", function () {
  const stationA = createStation("A");
  const stationB = createStation("B");
  const stationC = createStation("C");
  const stationD = createStation("D");

  const connection1 = createConnection(stationA, stationB);
  const connection2 = createConnection(stationB, stationC);
  const connection3 = createConnection(stationC, stationD);

  const journey = new types.Journey([connection1, connection2, connection3]);
  expect(journey.stopovers).toStrictEqual([
    stationA.city,
    stationB.city,
    stationC.city,
    stationD.city,
  ]);
});
