const { autoincrementer, differenceInDays } = require("../script/util.js");

test("consecutiveDaysShouldHaveOneDayDifference", function () {
  const date1 = new Date("2024-09-01");
  const date2 = new Date("2024-09-02");
  expect(differenceInDays(date1, date2)).toBe(1);
});
