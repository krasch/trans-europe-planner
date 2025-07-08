/**
 * @jest-environment jsdom
 */

import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";

import {
  prepareDataForPerlschnur,
  formatTimedelta,
} from "/script/data/components/perlschnur.js";
import { Itinerary } from "/script/types/itinerary.js";

import { initTestDOM } from "/tests/_helpers/domUtils.js";
import {
  getTestColor as _color,
  connectionFromShorthand as _c,
  DAY1,
} from "/tests/_helpers/data.js";
import { identifiers } from "/script/data/components/_common.js";

beforeEach(async () => {
  initTestDOM(); // needed to get connection colors from css
});

test("humanReadableTimedelta", function () {
  const t1 = DateTime.fromISO("20241010T10:12");
  const t2 = DateTime.fromISO("20241012T06:07");
  expect(formatTimedelta(t1, t2)).toBe("43h 55min");
});

test("prepareDataForPerlschnurEmpty", function () {
  const got = prepareDataForPerlschnur(null);

  const exp = { summary: {}, connections: [], transfers: [] };
  expect(got).toStrictEqual(exp);
});

test("prepareDataForPerlschnurSingleConnectionNoIntermediateStops", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const i1 = new Itinerary([c1]);

  const exp = {
    summary: {
      from: "S1",
      to: "S2",
      via: "",
      totalTime: "1h",
    },
    connections: [
      {
        id: identifiers.connection(c1),
        color: _color(0),
        icon: expect.stringMatching("train.svg"),
        name: c1.name,
        travelTime: "1h",
        stops: [
          { date: null, time: "10:00", station: "S1" },
          { date: null, time: "11:00", station: "S2" },
        ],
      },
    ],
    transfers: [],
  };

  const got = prepareDataForPerlschnur(i1);
  expect(got).toEqual(exp);
});

test("prepareDataForPerlschnurSingleConnectionIntermediateStops", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const exp = {
    summary: {
      from: "S1",
      to: "S3",
      via: "",
      totalTime: "2h",
    },
    connections: [
      {
        id: identifiers.connection(c1),
        color: _color(0),
        icon: expect.stringMatching("train.svg"),
        name: c1.name,
        travelTime: "2h",
        stops: [
          { date: null, time: "10:00", station: "S1" },
          { date: null, time: "11:00", station: "S2" },
          { date: null, time: "12:00", station: "S3" },
        ],
      },
    ],
    transfers: [],
  };

  const got = prepareDataForPerlschnur(i1);
  expect(got).toEqual(exp);
});

test("prepareDataForPerlschnurMultipleConnections", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c2 = _c("T2: S2@D1T12->S3@D1T14");
  const c3 = _c("T3: S3@D1T16->S4@D1T17");
  const i1 = new Itinerary([c1, c2, c3]);

  const exp = {
    summary: {
      from: "S1",
      to: "S4",
      via: "via S2, S3",
      totalTime: "7h",
    },
    connections: [
      {
        id: identifiers.connection(c1),
        color: _color(0),
        icon: expect.stringMatching("train.svg"),
        name: c1.name,
        travelTime: "1h",
        stops: [
          { date: null, time: "10:00", station: "S1" },
          { date: null, time: "11:00", station: "S2" },
        ],
      },
      {
        id: identifiers.connection(c2),
        color: _color(1),
        icon: expect.stringMatching("train.svg"),
        name: c2.name,
        travelTime: "2h",
        stops: [
          { date: null, time: "12:00", station: "S2" },
          { date: null, time: "14:00", station: "S3" },
        ],
      },
      {
        id: identifiers.connection(c3),
        color: _color(2),
        icon: expect.stringMatching("train.svg"),
        name: c3.name,
        travelTime: "1h",
        stops: [
          { date: null, time: "16:00", station: "S3" },
          { date: null, time: "17:00", station: "S4" },
        ],
      },
    ],
    transfers: [{ time: "1h" }, { time: "2h" }],
  };

  const got = prepareDataForPerlschnur(i1);
  expect(got).toEqual(exp);
});

test("prepareDataForPerlschnurMultipleConnectionsMultiday", function () {
  const c1 = _c("T1: S1@D1T10->S2@D2T11");
  const c2 = _c("T2: S2@D2T12->S3@D3T08");
  const c3 = _c("T3: S3@D4T16->S4@D4T17");
  const i1 = new Itinerary([c1, c2, c3]);

  // formatted date strings
  const D2 = `(${DAY1.plus({ days: 1 }).toFormat("d LLL")})`;
  const D3 = `(${DAY1.plus({ days: 2 }).toFormat("d LLL")})`;
  const D4 = `(${DAY1.plus({ days: 3 }).toFormat("d LLL")})`;

  const exp = {
    summary: {
      from: "S1",
      to: "S4",
      via: "via S2, S3",
      totalTime: "79h",
    },
    connections: [
      {
        id: identifiers.connection(c1),
        color: _color(0),
        icon: expect.stringMatching("train.svg"),
        name: c1.name,
        travelTime: "25h",
        stops: [
          { date: null, time: "10:00", station: "S1" },
          { date: D2, time: "11:00", station: "S2" },
        ],
      },
      {
        id: identifiers.connection(c2),
        color: _color(1),
        icon: expect.stringMatching("train.svg"),
        name: c2.name,
        travelTime: "20h",
        stops: [
          { date: null, time: "12:00", station: "S2" },
          { date: D3, time: "08:00", station: "S3" },
        ],
      },
      {
        id: identifiers.connection(c3),
        color: _color(2),
        icon: expect.stringMatching("train.svg"),
        name: c3.name,
        travelTime: "1h",
        stops: [
          { date: D4, time: "16:00", station: "S3" },
          { date: null, time: "17:00", station: "S4" },
        ],
      },
    ],
    transfers: [{ time: "1h" }, { time: "32h" }],
  };

  const got = prepareDataForPerlschnur(i1);
  expect(got).toEqual(exp);
});
