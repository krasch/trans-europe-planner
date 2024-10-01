const { Journey } = require("../script/types.js");
const { DATA, createConnection } = require("./data_utils.js");

test("emptyJourney", function () {
  const journey = new Journey([]);
  expect(journey.stopovers).toStrictEqual([]);
  expect(journey.legs).toStrictEqual([]);
});

test("journeyWithOneConnection", function () {
  const connection = createConnection(1, DATA.stationA, DATA.stationB);
  const journey = new Journey([connection]);

  const expectedStopovers = [DATA.stationA.city, DATA.stationB.city];
  const expectedLegs = [connection.leg];

  expect(journey.stopovers).toStrictEqual(expectedStopovers);
  expect(journey.legs).toStrictEqual(expectedLegs);
});

test("journeyWithMultipleConnections", function () {
  const connection1 = createConnection(1, DATA.stationA, DATA.stationB);
  const connection2 = createConnection(2, DATA.stationB, DATA.stationC);
  const connection3 = createConnection(3, DATA.stationC, DATA.stationD);

  const journey = new Journey([connection1, connection2, connection3]);

  const expectedStopovers = [
    DATA.stationA.city,
    DATA.stationB.city,
    DATA.stationC.city,
    DATA.stationD.city,
  ];
  const expectedLegs = [connection1.leg, connection2.leg, connection3.leg];

  expect(journey.stopovers).toStrictEqual(expectedStopovers);
  expect(journey.legs).toStrictEqual(expectedLegs);
});

test("changeConnection", function () {
  const connection1 = createConnection(1, DATA.stationA, DATA.stationB);
  const connection2 = createConnection(2, DATA.stationA, DATA.stationB);

  const journey = new Journey([connection1]);
  expect(journey.connections).toStrictEqual([connection1]);

  journey.changeLeg(connection1.leg.id, connection2);
  expect(journey.connections).toStrictEqual([connection2]);
});
