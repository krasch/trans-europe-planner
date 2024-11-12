const { CustomDateTime } = require("../script/util.js");
const { Journey, JourneyError } = require("../script/componentData.js");

test("testInit", function () {
  const journey = new Journey({ a: 1, b: 2 });
  expect(journey.unsortedLegs).toStrictEqual(["a", "b"]);
  expect(journey.unsortedConnections).toStrictEqual([1, 2]);
  expect(() => journey.previousConnection("b")).toThrow(JourneyError);
});

test("testRemoveNonExistingLeg", function () {
  const journey = new Journey({ a: 1, b: 2 });
  expect(() => journey.removeLeg("c")).toThrow(JourneyError);
});

test("testRemoveLeg", function () {
  const journey = new Journey({ a: 1, b: 2, c: 3 });
  journey.removeLeg("b");

  expect(journey.unsortedLegs).toStrictEqual(["a", "c"]);
  expect(journey.unsortedConnections).toStrictEqual([1, 3]);
  expect(journey.previousConnection("b")).toBe(2);
});

test("testSetConnectionUnknownLeg", function () {
  const journey = new Journey({ a: 1, b: 2 });
  journey.setConnectionForLeg("c", 3);

  expect(journey.unsortedLegs).toStrictEqual(["a", "b", "c"]);
  expect(journey.unsortedConnections).toStrictEqual([1, 2, 3]);
});

test("testSetConnectionKnownLeg", function () {
  const journey = new Journey({ a: 1, b: 2 });
  journey.setConnectionForLeg("a", 3);

  expect(journey.unsortedLegs).toStrictEqual(["a", "b"]);
  expect(journey.unsortedConnections).toStrictEqual([3, 2]);
});
