const {
  calculateDiffs,
  groupDiffsById,
  StateCollection,
} = require("../script/util.js");

test("updated", function () {
  const oldData = { 1: { a: 1 } };
  const newData = { 1: { a: 2 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "updated", id: "1", key: "a", newValue: 2 }];

  expect(got).toStrictEqual(exp);
});

test("added", function () {
  const oldData = { 1: { a: 1 } };
  const newData = { 1: { a: 1, b: 2 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "added", id: "1", key: "b", newValue: 2 }];

  expect(got).toStrictEqual(exp);
});

test("removed", function () {
  const oldData = { 1: { a: 1, b: 2 } };
  const newData = { 1: { a: 1 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "removed", id: "1", key: "b", newValue: null }];

  expect(got).toStrictEqual(exp);
});

test("itemAdded", function () {
  const oldData = { 1: { a: 1 } };
  const newData = { 1: { a: 1 }, 2: { a: 1, b: 2 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [
    { kind: "added", id: "2", key: "a", newValue: 1 },
    { kind: "added", id: "2", key: "b", newValue: 2 },
  ];

  expect(got).toStrictEqual(exp);
});

test("itemRemoved", function () {
  const oldData = { 1: { a: 1 }, 2: { a: 1, b: 2 } };
  const newData = { 1: { a: 1 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [
    { kind: "removed", id: "2", key: "a", newValue: null },
    { kind: "removed", id: "2", key: "b", newValue: null },
  ];

  expect(got).toStrictEqual(exp);
});

test("oldEmpty", function () {
  const oldData = {};
  const newData = { 1: { a: 1 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "added", id: "1", key: "a", newValue: 1 }];

  expect(got).toStrictEqual(exp);
});

test("newEmpty", function () {
  const oldData = { 1: { a: 1 } };
  const newData = {};

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "removed", id: "1", key: "a", newValue: null }];

  expect(got).toStrictEqual(exp);
});

test("oldItemEmpty", function () {
  const oldData = { 1: {} };
  const newData = { 1: { a: 1 } };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "added", id: "1", key: "a", newValue: 1 }];

  expect(got).toStrictEqual(exp);
});

test("newItemEmpty", function () {
  const oldData = { 1: { a: 1 } };
  const newData = { 1: {} };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [{ kind: "removed", id: "1", key: "a", newValue: null }];

  expect(got).toStrictEqual(exp);
});

test("allTheChanges", function () {
  const oldData = {
    1: { a: 1, b: true },
    2: { a: 3, c: "ladida" },
  };
  const newData = {
    1: { a: 2, c: "hallo" },
    3: { a: 0, c: "test" },
  };

  const got = Array.from(calculateDiffs(oldData, newData));
  const exp = [
    { kind: "updated", id: "1", key: "a", newValue: 2 },
    { kind: "removed", id: "1", key: "b", newValue: null },
    { kind: "removed", id: "2", key: "a", newValue: null },
    { kind: "removed", id: "2", key: "c", newValue: null },
    { kind: "added", id: "1", key: "c", newValue: "hallo" },
    { kind: "added", id: "3", key: "a", newValue: 0 },
    { kind: "added", id: "3", key: "c", newValue: "test" },
  ];

  expect(got).toStrictEqual(exp); // only works if exp given in right order
});

test("groupById", function () {
  const diff = [
    { kind: "updated", id: "1", key: "a", newValue: 2 },
    { kind: "removed", id: "1", key: "b", newValue: null },
    { kind: "removed", id: "2", key: "a", newValue: null },
    { kind: "removed", id: "2", key: "c", newValue: null },
    { kind: "added", id: "1", key: "c", newValue: "hallo" },
    { kind: "added", id: "3", key: "a", newValue: 0 },
    { kind: "added", id: "3", key: "c", newValue: "test" },
  ];

  const got = groupDiffsById(diff);
  const exp = {
    1: [
      { kind: "updated", id: "1", key: "a", newValue: 2 },
      { kind: "removed", id: "1", key: "b", newValue: null },
      { kind: "added", id: "1", key: "c", newValue: "hallo" },
    ],
    2: [
      { kind: "removed", id: "2", key: "a", newValue: null },
      { kind: "removed", id: "2", key: "c", newValue: null },
    ],
    3: [
      { kind: "added", id: "3", key: "a", newValue: 0 },
      { kind: "added", id: "3", key: "c", newValue: "test" },
    ],
  };

  expect(got).toStrictEqual(exp); // only works if exp given in right order
});

test("stateNoDefaults", () => {
  const state = new StateCollection();

  let got = state.setToDefaults();
  let exp = [];
  expect(got).toStrictEqual(exp);

  // setting for the first time
  got = state.update({ 1: { a: 7 } });
  exp = [{ kind: "added", id: "1", key: "a", newValue: 7 }];
  expect(got).toStrictEqual(exp);

  // setting to different value
  got = state.update({ 1: { a: 3 } });
  exp = [{ kind: "updated", id: "1", key: "a", newValue: 3 }];
  expect(got).toStrictEqual(exp);

  // unset (=reset to default)
  got = state.update({});
  exp = [{ kind: "removed", id: "1", key: "a", newValue: null }];
  expect(got).toStrictEqual(exp);

  // setting again
  got = state.update({ 1: { a: 7 } });
  exp = [{ kind: "added", id: "1", key: "a", newValue: 7 }];
  expect(got).toStrictEqual(exp);
});

test("stateInitForgotten", () => {
  const state = new StateCollection({ 1: { a: 7 } });
  expect(() => state.update([{ id: 1, a: 2 }])).toThrow(Error);
});

test("stateDefaults", () => {
  const state = new StateCollection({ 1: { a: 7 } });

  let got = state.setToDefaults();
  let exp = [{ kind: "added", id: "1", key: "a", newValue: 7 }];
  expect(got).toStrictEqual(exp);

  // setting to exact same value
  got = state.update({ 1: { a: 7 } });
  exp = [];
  expect(got).toStrictEqual(exp);

  // setting to different value
  got = state.update({ 1: { a: 3 } });
  exp = [{ kind: "updated", id: "1", key: "a", newValue: 3 }];
  expect(got).toStrictEqual(exp);

  // unset (=reset to default)
  got = state.update({});
  exp = [{ kind: "updated", id: "1", key: "a", newValue: 7 }];
  expect(got).toStrictEqual(exp);

  // setting to exact same value
  got = state.update({ 1: { a: 7 } });
  exp = [];
  expect(got).toStrictEqual(exp);

  // unset (=reset to default) but are already at default
  got = state.update({});
  exp = [];
  expect(got).toStrictEqual(exp);
});
