import { InputConnectionDataWrapper } from "script/data/sources/hardcoded.js";

import { DAY1, connectionFromShorthand as _c } from "tests/_helpers/data.js";
import {
  initGeoDatabase,
  hardcodedConnectionDataFromShorthand,
} from "tests/data/sources/hardcoded/data.js";

function _wrapper(shorthand) {
  return new InputConnectionDataWrapper(
    hardcodedConnectionDataFromShorthand(shorthand),
  );
}

test.each([
  // just a simple, non-overnight connection
  {
    connection: "T1: S1@T10->S2@T11",
    expected: "T1: S1@D1T10->S2@D1T11",
  },
  // overnight connection
  {
    connection: "T2: S1@T10->S2@T25",
    expected: "T2: S1@D1T10->S2@D2T01",
  },
  // many night connection, with day skip between S2 and S3
  {
    connection: "T3: S1@T10->S2@T25->S3@T73",
    expected: "T3: S1@D1T10->S2@D2T01->S3@D4T01",
  },
])("Convert to dated connection", function (data) {
  const connection = _wrapper(data.connection);
  const got = connection.convert(DAY1, initGeoDatabase());
  expect(got).toStrictEqual(_c(data.expected));
});

test.each([
  // right direction
  {
    connection: "T1: S1@T10->S2@T25->S3@T7",
    fromStopId: "S1",
    toStopId: "S2",
    expected: true,
  },
  // wrong direction
  {
    connection: "T3: S1@T10->S2@T25->S3@T7",
    fromStopId: "S2",
    toStopId: "S1",
    expected: false,
  },
  // fromStopId not in the connection
  {
    connection: "T3: S1@T10->S2@T25->S3@T7",
    fromStopId: "S4",
    toStopId: "S1",
    expected: false,
  },
  // toStopId not in the connection
  {
    connection: "T4: S1@T10->S2@T25->S3@T7",
    fromStopId: "S1",
    toStopId: "S4",
    expected: false,
  },
  //
])("Check if connects two stops", function (data) {
  const connection = _wrapper(data.connection);
  const got = connection.connects(data.fromStopId, data.toStopId);
  expect(got).toStrictEqual(data.expected);
});

test.each([
  // [from, to] -> [from, to]
  {
    original: "T1: S1@T10->S2@T11",
    fromStopId: "S1",
    toStopId: "S2",
    expected: "T1: S1@T10->S2@T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1]
  {
    original: "T2: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S1",
    toStopId: "S2",
    expected: "T2: S1@T10->S2@T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2]
  {
    original: "T3: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S1",
    toStopId: "S3",
    expected: "T3: S1@T10->S2@T11->S3@T12",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2, to]
  {
    original: "T4: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S1",
    toStopId: "S4",
    expected: "T4: S1@T10->S2@T11->S3@T12->S4@T13",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2]
  {
    original: "T5: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S2",
    toStopId: "S3",
    expected: "T5: S2@T11->S3@T12",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2, to]
  {
    original: "T6: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S2",
    toStopId: "S4",
    expected: "T6: S2@T11->S3@T12->S4@T13",
  },
  // [from, inter1, inter2, to] -> [inter2, to]
  {
    original: "T7: S1@T10->S2@T11->S3@T12->S4@T13",
    fromStopId: "S3",
    toStopId: "S4",
    expected: "T7: S3@T12->S4@T13",
  },
  // overnight, need to update the hours
  {
    original: "T8: S1@T10->S2@T74->S3@T75->S4@T76",
    fromStopId: "S2",
    toStopId: "S4",
    expected: "T8: S2@T02->S3@T03->S4@T04",
  },
])("Slices connection between two stopIds", function (data) {
  const connection = _wrapper(data.original);
  const exp = _wrapper(data.expected);

  const got = connection.slice(data.fromStopId, data.toStopId);
  expect(got).toStrictEqual(exp);
});
