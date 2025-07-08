import { groupBy } from "/script/util.js";

test("groupBy", function () {
  const items = [
    { key: 1, val: 10 },
    { key: 2, val: 11 },
    { key: 2, val: 12 },
    { key: "xyz", val: 13 },
    { key: 1, val: 14 },
  ];

  const exp = {
    1: [items[0], items[4]],
    2: [items[1], items[2]],
    xyz: [items[3]],
  };

  const got = groupBy(items, (i) => i.key);
  expect(got).toStrictEqual(exp);
});

test("groupByNoItems", function () {
  const items = [];

  const exp = {};

  const got = groupBy(items, (i) => i.key);
  expect(got).toStrictEqual(exp);
});
