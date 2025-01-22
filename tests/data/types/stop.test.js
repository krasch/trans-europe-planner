const { Stop } = require("../../../script/data/types/connection.js");
const { DateTime } = require("luxon");

function createStop(arrival, departure) {
  return new Stop(arrival, departure, 10, "Station10", false, 1, "City1");
}

test("changeDateZeroDays", function () {
  const stop = createStop(
    DateTime.fromISO("2024-10-12T18:00"),
    DateTime.fromISO("2024-10-14T19:00"),
  );

  const got = stop.shiftDate(0);
  const exp = createStop(
    DateTime.fromISO("2024-10-12T18:00"),
    DateTime.fromISO("2024-10-14T19:00"),
  );

  expect(got).toStrictEqual(exp);
});

test("changeDateForward", function () {
  const stop = createStop(
    DateTime.fromISO("2024-10-12T18:00"),
    DateTime.fromISO("2024-10-14T19:00"),
  );

  const got = stop.shiftDate(13);
  const exp = createStop(
    DateTime.fromISO("2024-10-25T18:00"),
    DateTime.fromISO("2024-10-27T19:00"),
  );

  expect(got).toStrictEqual(exp);
});

test("changeDateBackward", function () {
  const stop = createStop(
    DateTime.fromISO("2024-10-12T18:00"),
    DateTime.fromISO("2024-10-14T19:00"),
  );

  const got = stop.shiftDate(-13);
  const exp = createStop(
    DateTime.fromISO("2024-09-29T18:00"),
    DateTime.fromISO("2024-10-01T19:00"),
  );

  expect(got).toStrictEqual(exp);
});
