const { autoincrementer } = require("../script/types.js");

test("autoincrementerShouldIncrement", function () {
  const incrementer = autoincrementer();
  expect(incrementer()).toBe(1);
  expect(incrementer()).toBe(2);
  expect(incrementer()).toBe(3);
  expect(incrementer()).toBe(4);
  expect(incrementer()).toBe(5);
});
