/**
 * @vitest-environment jsdom
 */
import { test, expect, vi } from "vitest";

import {
  prepareDataForPerlschnur,
  formatTimedelta,
  formatDate,
} from "app/components/_data/perlschnur.js";
import { DateTime } from "app/types/dateTime.js";

import { itineraryFromShortHand as _i, DAY1 } from "tests/_helpers/data.js";
import { TEST_COLORS } from "tests/_helpers/data.js";

const DAY1_STRING = `(${formatDate(DAY1)})`;
const DAY2_STRING = `(${formatDate(DAY1.plus({ day: 1 }))})`;

vi.mock("app/assets.js", () => {
  return {
    getColor: (idx) => TEST_COLORS[idx],
    getIcon: (mode) => `${mode}.svg`,
  };
});

test("Human readable timedelta", function () {
  const t1 = DateTime.fromISO("20241010T10:12");
  const t2 = DateTime.fromISO("20241012T06:07");
  expect(formatTimedelta(t1, t2)).toBe("43h 55min");
});

test("Single connection, no intermediate stops", function () {
  const i = _i(["T1: S1@D1T10->S2@D1T11"]);

  const exp = [
    {
      id: i.connections[0].id.toString(),
      color: TEST_COLORS[0],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[0].name,
      travelTime: "59min",
      transferTime: null,
      stops: [
        { date: DAY1_STRING, time: "10:01", stopId: "S1", stopName: "Stop1" },
        { date: "", time: "11:00", stopId: "S2", stopName: "Stop2" },
      ],
    },
  ];

  const got = prepareDataForPerlschnur(i);
  expect(got).toEqual(exp);
});

test("Single connection, intermediate stops", function () {
  const i = _i(["T1: S1@D1T10->S2@D1T11->S3@D1T12->S4@D1T15"]);

  const exp = [
    {
      id: i.connections[0].id.toString(),
      color: TEST_COLORS[0],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[0].name,
      travelTime: "4h 59min",
      transferTime: null,
      stops: [
        { date: DAY1_STRING, time: "10:01", stopId: "S1", stopName: "Stop1" },
        { date: "", time: "11:00", stopId: "S2", stopName: "Stop2" },
        { date: "", time: "12:00", stopId: "S3", stopName: "Stop3" },
        { date: "", time: "15:00", stopId: "S4", stopName: "Stop4" },
      ],
    },
  ];

  const got = prepareDataForPerlschnur(i);
  expect(got).toEqual(exp);
});

test("Single connection, intermediate stops, overnight", function () {
  const i = _i(["T1: S1@D1T10->S2@D1T11->S3@D2T12->S4@D2T15"]);

  const exp = [
    {
      id: i.connections[0].id.toString(),
      color: TEST_COLORS[0],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[0].name,
      travelTime: "28h 59min",
      transferTime: null,
      stops: [
        { date: DAY1_STRING, time: "10:01", stopId: "S1", stopName: "Stop1" },
        { date: "", time: "11:00", stopId: "S2", stopName: "Stop2" },
        { date: DAY2_STRING, time: "12:00", stopId: "S3", stopName: "Stop3" },
        { date: "", time: "15:00", stopId: "S4", stopName: "Stop4" },
      ],
    },
  ];

  const got = prepareDataForPerlschnur(i);
  expect(got).toEqual(exp);
});

test("Multiple connections, overnight change", function () {
  const i = _i([
    "T1: S1@D1T10->S2@D1T11",
    "T2: S2@D2T10->S3@D2T11->S4@D2T12",
    "T3: S4@D2T15->S5@D2T17",
  ]);

  const exp = [
    {
      id: i.connections[0].id.toString(),
      color: TEST_COLORS[0],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[0].name,
      travelTime: "59min",
      transferTime: "23h 1min",
      stops: [
        { date: DAY1_STRING, time: "10:01", stopId: "S1", stopName: "Stop1" },
        { date: "", time: "11:00", stopId: "S2", stopName: "Stop2" },
      ],
    },
    {
      id: i.connections[1].id.toString(),
      color: TEST_COLORS[1],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[1].name,
      travelTime: "1h 59min",
      transferTime: "3h 1min",
      stops: [
        { date: DAY2_STRING, time: "10:01", stopId: "S2", stopName: "Stop2" },
        { date: "", time: "11:00", stopId: "S3", stopName: "Stop3" },
        { date: "", time: "12:00", stopId: "S4", stopName: "Stop4" },
      ],
    },
    {
      id: i.connections[2].id.toString(),
      color: TEST_COLORS[2],
      icon: expect.stringMatching("RAIL.svg"),
      name: i.connections[2].name,
      travelTime: "1h 59min",
      transferTime: null,
      stops: [
        { date: "", time: "15:01", stopId: "S4", stopName: "Stop4" },
        { date: "", time: "17:00", stopId: "S5", stopName: "Stop5" },
      ],
    },
  ];

  const got = prepareDataForPerlschnur(i);
  expect(got).toEqual(exp);
});
