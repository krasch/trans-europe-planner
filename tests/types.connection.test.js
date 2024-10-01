const { Connection, Leg } = require("../script/types.js");
const { DATA } = require("./data_utils.js");

test("connectionGetters", function () {
  const connection = new Connection(
    "DB-IC123",
    "IC123",
    "train",
    new Date("2024-10-14"),
    [
      { station: DATA.stationA, time: "10:00" },
      { station: DATA.stationB, time: "11:00" },
      { station: DATA.stationC, time: "12:00" },
      { station: DATA.stationD, time: "13:00" },
    ],
  );

  expect(connection.id).toBe("2024-10-14XDB-IC123");
  expect(connection.startStation).toStrictEqual(DATA.stationA);
  expect(connection.endStation).toStrictEqual(DATA.stationD);
  expect(connection.startTime).toBe("10:00");
  expect(connection.endTime).toBe("13:00");
  expect(connection.leg).toStrictEqual(new Leg(DATA.cityA, DATA.cityD));
});
