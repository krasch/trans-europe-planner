const { Journey } = require("../script/types.js");
const {
  createCity,
  createStation,
  createConnection,
} = require("../tests/util.js");

test("emptyJourney", function () {
  const journey = new Journey([]);
  expect(journey.stopovers).toStrictEqual([]);
  expect(journey.legs).toStrictEqual([]);
});

test("journeyWithOneConnection", function () {
  const cityA = createCity("A");
  const cityB = createCity("B");

  const stationA = createStation("A", cityA);
  const stationB = createStation("B", cityB);

  const connection = createConnection(1, stationA, stationB);
  const journey = new Journey([connection]);

  const expectedStopovers = [stationA.city, stationB.city];
  const expectedLegs = [connection.leg];

  expect(journey.stopovers).toStrictEqual(expectedStopovers);
  expect(journey.legs).toStrictEqual(expectedLegs);
});

test("journeyWithMultipleConnections", function () {
  const cityA = createCity("A");
  const cityB = createCity("B");
  const cityC = createCity("C");
  const cityD = createCity("D");

  const stationA = createStation("A", cityA);
  const stationB = createStation("B", cityB);
  const stationC = createStation("C", cityC);
  const stationD = createStation("D", cityD);

  const connection1 = createConnection(1, stationA, stationB);
  const connection2 = createConnection(2, stationB, stationC);
  const connection3 = createConnection(3, stationC, stationD);

  const journey = new Journey([connection1, connection2, connection3]);

  const expectedStopovers = [
    stationA.city,
    stationB.city,
    stationC.city,
    stationD.city,
  ];
  const expectedLegs = [connection1.leg, connection2.leg, connection3.leg];

  expect(journey.stopovers).toStrictEqual(expectedStopovers);
  expect(journey.legs).toStrictEqual(expectedLegs);
});

test("changeConnection", function () {
  const cityA = createCity("A");
  const cityB = createCity("B");

  const stationA = createStation("A", cityA);
  const stationB = createStation("B", cityB);

  const connection1 = createConnection(1, stationA, stationB);
  const connection2 = createConnection(2, stationA, stationB);

  const journey = new Journey([connection1]);
  expect(journey.connections).toStrictEqual([connection1]);

  journey.changeLeg(connection1.leg.id, connection2);
  expect(journey.connections).toStrictEqual([connection2]);
});
