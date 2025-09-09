import { Connection } from "script/types/connection.js";
import {
  stopFromData as _s,
  timestampFromShorthand as _ts,
} from "tests/_helpers/data.js";

test("Connection without intermediate stops", function () {
  const from = _s({ stopId: "S1", departure: _ts("D1T10") });
  const to = _s({ stopId: "S2", departure: _ts("D1T11") });

  const con = new Connection("123", "rail", "RE1", from, to, []);

  expect(con.id).toStrictEqual("123XXXS1XXXS2");
  expect(con.stops).toStrictEqual([from, to]);
  expect(con.edges).toStrictEqual([{ from: from, to: to }]);
});

test("Connection with intermediate stops", function () {
  const s1 = _s({ stopId: "S1", departure: _ts("D1T10") });
  const s2 = _s({ stopId: "S2", departure: _ts("D1T11") });
  const s3 = _s({ stopId: "S3", departure: _ts("D1T12") });
  const s4 = _s({ stopId: "S4", departure: _ts("D1T13") });
  const s5 = _s({ stopId: "S5", departure: _ts("D1T14") });

  const from = s1;
  const to = s5;
  const intermediate = [s2, s3, s4];

  const con = new Connection("123", "rail", "RE1", from, to, intermediate);

  expect(con.id).toStrictEqual("123XXXS1XXXS5");
  expect(con.stops).toStrictEqual([s1, s2, s3, s4, s5]);
  expect(con.edges).toStrictEqual([
    { from: s1, to: s2 },
    { from: s2, to: s3 },
    { from: s3, to: s4 },
    { from: s4, to: s5 },
  ]);
});

test("Connection single day", function () {
  const from = _s({ stopId: "S1", departure: _ts("D1T10") });
  const to = _s({ stopId: "S2", departure: _ts("D1T11") });

  const con = new Connection("123", "rail", "RE1", from, to, []);
  expect(con.isMultiday).toStrictEqual(false);
});

test("Connection multiday", function () {
  const from = _s({ stopId: "S1", departure: _ts("D1T10") });
  const to = _s({ stopId: "S2", departure: _ts("D2T11") });

  const con = new Connection("123", "rail", "RE1", from, to, []);
  expect(con.isMultiday).toStrictEqual(true);
});
