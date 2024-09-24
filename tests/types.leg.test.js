const { Leg } = require("../script/types.js");
const { createCity } = require("../tests/util.js");

test("testLegShouldHaveNameAndNumericId", function () {
  const start = createCity("A");
  const end = createCity("B");
  const leg = new Leg(start, end);

  expect(start.numericId).toBe(1);
  expect(end.numericId).toBe(2);
  expect(leg.numericId).toBe(1002); // # 1*1000 + 2
  expect(leg.name).toBe("A -> B");
});
