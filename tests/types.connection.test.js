const { Leg, Connection } = require("../script/types.js");
const { createCity, createStation } = require("../tests/util.js");

test("connectionGetters", function () {
  const cityA = createCity("A");
  const cityB = createCity("B");
  const cityC = createCity("C");
  const cityD = createCity("D");

  const stationA = createStation("A", cityA);
  const stationB = createStation("B", cityB);
  const stationC = createStation("C", cityC);
  const stationD = createStation("D", cityD);

  const connection = new Connection(
    "DB-IC123",
    "IC123",
    "train",
    new Date("2024-10-14"),
    [
      { station: stationA, time: "10:00" },
      { station: stationB, time: "11:00" },
      { station: stationC, time: "12:00" },
      { station: stationD, time: "13:00" },
    ],
  );

  expect(connection.id).toBe("2024-10-14XDB-IC123");
  expect(connection.startStation).toStrictEqual(stationA);
  expect(connection.endStation).toStrictEqual(stationD);
  expect(connection.startTime).toBe("10:00");
  expect(connection.endTime).toBe("13:00");
  expect(connection.leg.numericId).toBe(new Leg(cityA, cityD).numericId);
});
