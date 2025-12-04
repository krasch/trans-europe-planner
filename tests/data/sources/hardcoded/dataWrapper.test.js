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
    fromCityId: "C1",
    toCityId: "C2",
    expected: true,
  },
  // wrong direction
  {
    connection: "T3: S1@T10->S2@T25->S3@T7",
    fromCityId: "C2",
    toCityId: "C1",
    expected: false,
  },
  // fromCityId not in the connection
  {
    connection: "T3: S1@T10->S2@T25->S3@T7",
    fromCityId: "C4",
    toCityId: "C1",
    expected: false,
  },
  // toCityId not in the connection
  {
    connection: "T4: S1@T10->S2@T25->S3@T7",
    fromCityId: "C1",
    toCityId: "C4",
    expected: false,
  },
  // fromCityId has multiple stops (S5A and S5B are in C5)
  {
    connection: "T5: S5A@T10->S1@T17",
    fromCityId: "C5",
    toCityId: "C1",
    expected: true,
  },
  // toCityId has multiple stops (S5A and S5B are in C5)
  {
    connection: "T5: S1@T10->S5B@T17",
    fromCityId: "C1",
    toCityId: "C5",
    expected: true,
  },
  //
])("Check if connects two cities", function (data) {
  const connection = _wrapper(data.connection);
  const got = connection.connectsCityToCity(
    data.fromCityId,
    data.toCityId,
    initGeoDatabase(),
  );
  expect(got).toStrictEqual(data.expected);
});

test.each([
  // [from, to] -> [from, to]
  {
    original: "T1: S1@T10->S2@T11",
    fromCityId: "C1",
    toCityId: "C2",
    expected: "T1: S1@T10->S2@T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1]
  {
    original: "T2: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C1",
    toCityId: "C2",
    expected: "T2: S1@T10->S2@T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2]
  {
    original: "T3: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C1",
    toCityId: "C3",
    expected: "T3: S1@T10->S2@T11->S3@T12",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2, to]
  {
    original: "T4: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C1",
    toCityId: "C4",
    expected: "T4: S1@T10->S2@T11->S3@T12->S4@T13",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2]
  {
    original: "T5: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C2",
    toCityId: "C3",
    expected: "T5: S2@T11->S3@T12",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2, to]
  {
    original: "T6: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C2",
    toCityId: "C4",
    expected: "T6: S2@T11->S3@T12->S4@T13",
  },
  // [from, inter1, inter2, to] -> [inter2, to]
  {
    original: "T7: S1@T10->S2@T11->S3@T12->S4@T13",
    fromCityId: "C3",
    toCityId: "C4",
    expected: "T7: S3@T12->S4@T13",
  },
  // overnight, need to update the hours
  {
    original: "T8: S1@T10->S2@T74->S3@T75->S4@T76",
    fromCityId: "C2",
    toCityId: "C4",
    expected: "T8: S2@T02->S3@T03->S4@T04",
  },
  // fromCityId is a city with multiple stops, it stops only in main stop (S5A)
  {
    original: "T9: S1@T10->S5A@T11->S3@T12->S4@T13",
    fromCityId: "C5",
    toCityId: "C3",
    expected: "T9: S5A@T11->S3@T12",
  },
  // fromCityId is a city with multiple stops, it stops only in secondary stop (S5B)
  {
    original: "T10: S1@T10->S5B@T11->S3@T12->S4@T13",
    fromCityId: "C5",
    toCityId: "C3",
    expected: "T10: S5B@T11->S3@T12",
  },
  // fromCityId is a city with multiple stops, it stops in main (S5A) and secondary stops (S5B, S5C)
  {
    original: "T11: S1@T09->S5B@T11->S5A@T11->S5C@T12->S3@T13->S4@T14",
    fromCityId: "C5",
    toCityId: "C3",
    expected: "T11: S5A@T11->S5C@T12->S3@T13",
  },
  // fromCityId is a city with multiple stops, it stops in two secondary stops (S5B, S5C)
  {
    original: "T12: S1@T09->S5B@T11->S5C@T12->S3@T13->S4@T14",
    fromCityId: "C5",
    toCityId: "C3",
    expected: "T12: S5C@T12->S3@T13", // should take latest secondary stop
  },
  // toCityId is a city with multiple stops, it stops only in main stop (S5A)
  {
    original: "T13: S1@T10->S5A@T11->S3@T12->S4@T13",
    fromCityId: "C1",
    toCityId: "C5",
    expected: "T13: S1@T10->S5A@T11",
  },
  // toCityId is a city with multiple stops, it stops only in secondary stop (S5B)
  {
    original: "T14: S1@T10->S5B@T11->S3@T12->S4@T13",
    fromCityId: "C1",
    toCityId: "C5",
    expected: "T14: S1@T10->S5B@T11",
  },
  // toCityId is a city with multiple stops, it stops in main (S5A) and secondary stops (S5B, S5C)
  {
    original: "T15: S1@T09->S5B@T11->S5A@T11->S5C@T12->S3@T13->S4@T14",
    fromCityId: "C1",
    toCityId: "C5",
    expected: "T15: S1@T09->S5B@T11->S5A@T11",
  },
  // toCityId is a city with multiple stops, it stops in two secondary stops (S5B, S5C)
  {
    original: "T16: S1@T09->S5B@T11->S5C@T12->S3@T13->S4@T14",
    fromCityId: "C1",
    toCityId: "C5",
    expected: "T16: S1@T09->S5B@T11", // should take earliest secondary stop
  },
])("Slices connection between two cities", function (data) {
  const connection = _wrapper(data.original);
  const exp = _wrapper(data.expected);

  const got = connection.sliceCityToCity(
    data.fromCityId,
    data.toCityId,
    initGeoDatabase(),
  );
  expect(got).toStrictEqual(exp);
});
