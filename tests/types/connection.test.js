import { test, expect } from "vitest";

import { Connection, ConnectionId } from "app/types/connection.js";

import { DAY1, stopFromShorthand as _s } from "tests/_helpers/data.js";

test("Connection id", function () {
  const id1 = new ConnectionId("123", "S1", "S2", DAY1);
  const id2 = new ConnectionId("456", "S1", "S2", DAY1);
  const id3 = new ConnectionId("456", "S1", "S3", DAY1);

  const id1String = "123XXXS1XXXS2XXX2024-10-15";
  expect(id1.toString()).toBe(id1String);
  expect(ConnectionId.fromString(id1String)).toStrictEqual(id1);

  expect(id1.equals(id1)).toBe(true);
  expect(id1.equals(id2)).toBe(false);

  expect(id1.isSameLeg(id2)).toBe(true);
  expect(id1.isSameLeg(id3)).toBe(false);
});

test("Connection without intermediate stops", function () {
  const from = _s("S1@D1T10");
  const to = _s("S2@D1T11");

  const con = new Connection("123", "rail", "RE1", from, to, []);

  expect(con.id).toStrictEqual(new ConnectionId("123", "S1", "S2", DAY1));
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

  expect(con.id).toStrictEqual(new ConnectionId("123", "S1", "S5", DAY1));
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
