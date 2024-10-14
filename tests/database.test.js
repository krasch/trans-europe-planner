const { Leg } = require("../script/types.js");
const { Database } = require("../script/database.js");
const { createConnection, DATA } = require("./data_utils.js");

test("getAllLegsEmpty", function () {
  const database = new Database([]);

  const expected = [];
  expect(Array.from(database.getAllLegs())).toStrictEqual(expected);
});

test("getAllLegsOneConnection", function () {
  const connection = createConnection(1, DATA.stationA, DATA.stationB);
  const database = new Database([connection]);

  const expected = [new Leg(DATA.cityA, DATA.cityB)];
  expect(Array.from(database.getAllLegs())).toStrictEqual(expected);
});

test("getAllLegsMultipleConnectionsDifferentLegs", function () {
  const connection1 = createConnection(1, DATA.stationA, DATA.stationB);
  const connection2 = createConnection(2, DATA.stationB, DATA.stationC);
  const connection3 = createConnection(3, DATA.stationC, DATA.stationD);
  const database = new Database([connection1, connection2, connection3]);

  const expected = [
    new Leg(DATA.cityA, DATA.cityB),
    new Leg(DATA.cityB, DATA.cityC),
    new Leg(DATA.cityC, DATA.cityD),
  ];
  expect(Array.from(database.getAllLegs())).toStrictEqual(expected);
});

test("getAllLegsMultipleConnectionsSameLeg", function () {
  const connection1 = createConnection(1, DATA.stationA, DATA.stationB);
  const connection2 = createConnection(2, DATA.stationAOther, DATA.stationB);
  const connection3 = createConnection(3, DATA.stationC, DATA.stationD);
  const database = new Database([connection1, connection2, connection3]);

  const expected = [
    new Leg(DATA.cityA, DATA.cityB),
    new Leg(DATA.cityC, DATA.cityD),
  ];
  expect(Array.from(database.getAllLegs())).toStrictEqual(expected);
});
