import { test, expect } from "vitest";

import { Connection } from "script/types/connection.js";

import { stopFromShorthand as _s } from "tests/_helpers/data.js";

test("Connection without intermediate stops", function () {
  const from = _s("S1@D1T10");
  const to = _s("S2@D1T11");

  const con = new Connection("123", "rail", "RE1", from, to, []);

  expect(con.id).toStrictEqual("123XXXS1XXXS2");
  expect(con.stops).toStrictEqual([from, to]);
});

test("Connection with intermediate stops", function () {
  const s1 = _s("S1@D1T10");
  const s2 = _s("S2@D1T11");
  const s3 = _s("S3@D1T12");
  const s4 = _s("S4@D1T13");
  const s5 = _s("S5@D1T14");

  const from = s1;
  const to = s5;
  const intermediate = [s2, s3, s4];

  const con = new Connection("123", "rail", "RE1", from, to, intermediate);

  expect(con.id).toStrictEqual("123XXXS1XXXS5");
  expect(con.stops).toStrictEqual([s1, s2, s3, s4, s5]);
});

test("Connection single day", function () {
  const from = _s("S1@D1T10");
  const to = _s("S2@D1T11");

  const con = new Connection("123", "rail", "RE1", from, to, []);
  expect(con.isMultiday).toStrictEqual(false);
});

test("Connection multiday", function () {
  const from = _s("S1@D1T10");
  const to = _s("S2@D2T11");

  const con = new Connection("123", "rail", "RE1", from, to, []);
  expect(con.isMultiday).toStrictEqual(true);
});
