import fs from "fs";

import { GeoDatabase } from "script/data/geoDatabase.js";
import {
  HardcodedConnectionDatabase,
  initConnection,
  initDatetime,
  initStop,
  sliceConnection,
} from "script/data/sources/hardcoded.js";
import { DateTime } from "script/types/dateTime.js";

import {
  DAY1,
  connectionFromShorthand as _c,
  stopFromShorthand as _s,
} from "tests/_helpers/data.js";

// testing with the real data to make sure it is formatted as expected
const FILES = {
  cities: "data/europe_hardcoded/cities.json",
  stops: "data/europe_hardcoded/stops.json",
  connections: "data/europe_hardcoded/connections.json",
  routes: "data/europe_hardcoded/routes.json",
};

const CITIES = {
  S1: { name: "S1", geo: { latitude: 10, longitude: 10 } },
  S2: { name: "S2", geo: { latitude: 20, longitude: 20 } },
  S3: { name: "S3", geo: { latitude: 30, longitude: 30 } },
};

const STOPS = {
  S1: { name: "S1", geo: { latitude: 10, longitude: 10 }, cityId: "S1" },
  S2: { name: "S2", geo: { latitude: 20, longitude: 20 }, cityId: "S2" },
  S3: { name: "S3", geo: { latitude: 30, longitude: 30 }, cityId: "S3" },
};

function initGeoDatabase() {
  return new GeoDatabase(CITIES, STOPS);
}

function initConnectionDatabase(geoDatabase) {
  const connections = JSON.parse(fs.readFileSync(FILES.connections, "utf8"));
  const routes = JSON.parse(fs.readFileSync(FILES.routes, "utf8"));
  return new HardcodedConnectionDatabase(connections, routes, geoDatabase);
}

test("Init datetime", function () {
  const date = DateTime.fromISO("2025-09-30");
  const time = "36:10:00";

  const exp = DateTime.fromISO("2025-10-01T12:10");
  expect(initDatetime(date, time)).toStrictEqual(exp);
});

test("Init stop", function () {
  const data = {
    stopId: "S1",
    arrivalTime: "10:00:00",
    departureTime: "10:00:00",
  };

  const exp = _s("S1@D1T10");

  const got = initStop(data, DAY1, initGeoDatabase());
  expect(got).toStrictEqual(exp);
});

test("Init connection", function () {
  const data = {
    id: "T1",
    type: "REGIONAL_RAIL",
    name: "T1",
    stops: [
      {
        stopId: "S1",
        arrivalTime: null,
        departureTime: "10:00:00",
      },
      {
        stopId: "S2",
        arrivalTime: "11:00:00",
        departureTime: "11:00:00",
      },
      {
        stopId: "S3",
        arrivalTime: "12:00:00",
        departureTime: null,
      },
    ],
  };

  const exp = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const got = initConnection(data, DAY1, initGeoDatabase());
  expect(got).toStrictEqual(exp);
});

// slice connection
test.each([
  // [from, to] -> [from, to]
  {
    original: "T1: S1@D1T10->S2@D1T11",
    slice: [0, 2],
    expected: "T1: S1@D1T10->S2@D1T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1]
  {
    original: "T2: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [0, 2],
    expected: "T2: S1@D1T10->S2@D1T11",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2]
  {
    original: "T3: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [0, 3],
    expected: "T3: S1@D1T10->S2@D1T11->S3@D1T12",
  },
  // [from, inter1, inter2, to] -> [from, inter1, inter2, to]
  {
    original: "T4: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [0, 4],
    expected: "T4: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2]
  {
    original: "T5: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [1, 3],
    expected: "T5: S2@D1T11->S3@D1T12",
  },
  // [from, inter1, inter2, to] -> [inter1, inter2, to]
  {
    original: "T6: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [1, 4],
    expected: "T6: S2@D1T11->S3@D1T12->S3@D1T12",
  },
  // [from, inter1, inter2, to] -> [inter2, to]
  {
    original: "T7: S1@D1T10->S2@D1T11->S3@D1T12->S3@D1T12",
    slice: [2, 4],
    expected: "T7: S3@D1T12->S3@D1T12",
  },
])("Slice connection", function (data) {
  const original = _c(data.original);
  const expected = _c(data.expected);
  const [fromIdx, toIdx] = data.slice;
  expect(sliceConnection(original, fromIdx, toIdx)).toEqual(expected);
});
