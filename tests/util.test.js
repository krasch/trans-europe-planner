const {
  CustomDateTime,
  InvalidDatetimeFormatError,
} = require("../script/util.js");

test("parseTimestringWithSeconds", function () {
  const createDate = () => new CustomDateTime("2024-10-01", "02:09:05");
  expect(createDate).toThrow(InvalidDatetimeFormatError);
});

test("dateString", function () {
  const dt = new CustomDateTime("2024-10-01", "15:31:00");
  expect(dt.dateString).toBe("2024-10-01");
});

test("timeStringWithPad", function () {
  const dt = new CustomDateTime("2024-10-01", "02:09:00");
  expect(dt.timeString).toBe("02:09");
});

test("timeStringWithoutPad", function () {
  const dt = new CustomDateTime("2024-10-01", "15:31:00");
  expect(dt.timeString).toBe("15:31");
});

test("minutesSinceMidnight", function () {
  const dt = new CustomDateTime("2024-10-01", "15:30:00");
  expect(dt.minutesSinceMidnight).toBe(930);
});

test("minutesSinceMidnightAtMidnight", function () {
  const dt = new CustomDateTime("2024-10-01", "00:00:00");
  expect(dt.minutesSinceMidnight).toBe(0);
});

test("daysSinceSameDay", function () {
  const dt = new CustomDateTime("2024-10-01", "14:00:00");
  expect(dt.daysSince("2024-10-01")).toBe(0);
});

test("daysSinceYesterday", function () {
  const dt = new CustomDateTime("2024-10-01", "15:00:00");
  expect(dt.daysSince("2024-09-30")).toBe(1);
});

test("daysSinceTomorrow", function () {
  const dt = new CustomDateTime("2024-10-01", "08:00:00");
  expect(dt.daysSince("2024-10-02")).toBe(-1);
});

test("minutesSinceNow", function () {
  const dt1 = new CustomDateTime("2024-10-01", "14:30:00");
  const dt2 = new CustomDateTime("2024-10-01", "14:30:00");
  expect(dt1.minutesSince(dt2)).toBe(0);
});

test("minutesSinceEarlier", function () {
  const dt1 = new CustomDateTime("2024-10-01", "14:30:00");
  const dt2 = new CustomDateTime("2024-10-01", "13:37:00");
  expect(dt1.minutesSince(dt2)).toBe(53);
});

test("minutesSinceLater", function () {
  const dt1 = new CustomDateTime("2024-10-01", "14:30:00");
  const dt2 = new CustomDateTime("2024-10-01", "17:02:00");
  expect(dt1.minutesSince(dt2)).toBe(-152);
});

test("minutesSinceYesterday", function () {
  const dt1 = new CustomDateTime("2024-10-01", "01:30:00");
  const dt2 = new CustomDateTime("2024-09-30", "22:02:00");
  expect(dt1.minutesSince(dt2)).toBe(208);
});

test("minutesSinceTomorrow", function () {
  const dt1 = new CustomDateTime("2024-09-30", "23:31:00");
  const dt2 = new CustomDateTime("2024-10-01", "03:04:00");
  expect(dt1.minutesSince(dt2)).toBe(-213);
});

test("humanReadableSinceLessThanAnHour", function () {
  const dt1 = new CustomDateTime("2024-09-30", "13:04:00");
  const dt2 = new CustomDateTime("2024-09-30", "12:57:00");

  expect(dt1.humanReadableSince(dt2)).toBe("7min");
});

test("humanReadableSinceLessThanAnDay", function () {
  const dt1 = new CustomDateTime("2024-10-01", "01:07:00");
  const dt2 = new CustomDateTime("2024-09-30", "13:04:00");

  expect(dt1.humanReadableSince(dt2)).toBe("12h 3min");
});

test("humanReadableSinceLessThanTwoDays", function () {
  const dt1 = new CustomDateTime("2024-10-02", "01:07:00");
  const dt2 = new CustomDateTime("2024-09-30", "13:04:00");

  expect(dt1.humanReadableSince(dt2)).toBe("1d 12h 3min");
});

test("humanReadableSinceMoreThanTwoDays", function () {
  const dt1 = new CustomDateTime("2024-10-03", "01:07:00");
  const dt2 = new CustomDateTime("2024-09-30", "13:04:00");

  expect(dt1.humanReadableSince(dt2)).toBe("2d 12h 3min");
});
