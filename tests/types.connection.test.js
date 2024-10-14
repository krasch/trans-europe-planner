const {
  Connection,
  Leg,
  TooLongConnectionError,
} = require("../script/types.js");
const { CustomDateTime } = require("../script/util.js");
const { DATA } = require("./data_utils.js");

test("overnightConnectionShouldGiveError", function () {
  const createConnection = () =>
    new Connection("DB-IC123", "IC123", "train", [
      {
        station: DATA.stationA,
        datetime: new CustomDateTime("2024-10-14", "10:00:00"),
      },
      {
        station: DATA.stationB,
        datetime: new CustomDateTime("2024-10-15", "11:00:00"),
      },
    ]);
  expect(createConnection).toThrow(TooLongConnectionError);
});

test("connectionGetters", function () {
  const connection = new Connection("DB-IC123", "IC123", "train", [
    {
      station: DATA.stationA,
      datetime: new CustomDateTime("2024-10-14", "10:00:00"),
    },
    {
      station: DATA.stationB,
      datetime: new CustomDateTime("2024-10-14", "11:00:00"),
    },
    {
      station: DATA.stationC,
      datetime: new CustomDateTime("2024-10-14", "12:00:00"),
    },
    {
      station: DATA.stationD,
      datetime: new CustomDateTime("2024-10-14", "13:00:00"),
    },
  ]);

  expect(connection.id).toBe("2024-10-14XDB-IC123XA-D");
  expect(connection.startStation).toStrictEqual(DATA.stationA);
  expect(connection.endStation).toStrictEqual(DATA.stationD);
  expect(connection.startDateTime.dateString).toBe("2024-10-14");
  expect(connection.startDateTime.timeString).toBe("10:00");
  expect(connection.endDateTime.dateString).toBe("2024-10-14");
  expect(connection.endDateTime.timeString).toBe("13:00");
  expect(connection.leg).toStrictEqual(new Leg(DATA.cityA, DATA.cityD));
});
