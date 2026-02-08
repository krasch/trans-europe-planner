import { test, expect, vi } from "vitest";

import { prepareDataForCalendar } from "app/data/components/calendar.js";
import { Itinerary } from "app/types/itinerary.js";

import { connectionFromShorthand as _c } from "tests/_helpers/data.js";
import { TEST_COLORS } from "tests/_helpers/data.js";

vi.mock("app/data/components/_common.js", () => {
  return {
    getColor: (idx) => TEST_COLORS[idx],
    getIcon: (mode) => `${mode}.svg`,
  };
});

test("One connection, alternatives are still loading", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const alternatives = {};
  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      id: c1.id,
      leg: "S1->S3",
      name: c1.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1.from.stopName,
      departure: c1.from.departure,
      to: c1.to.stopName,
      arrival: c1.to.arrival,
      color: TEST_COLORS[0],
      status: "active-loading",
    },
  ];

  expect(got).toStrictEqual(exp);
});

test("One connection, alternatives are available", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c1_alt1 = _c("T2: S1@D2T10->S2@D2T11->S3@D2T12");
  const c1_alt2 = _c("T3: S1@D3T10->S2@D3T11->S3@D3T12");

  const i1 = new Itinerary([c1]);

  const alternatives = {};
  alternatives[c1.id] = [c1_alt1, c1_alt2];

  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      id: c1.id,
      leg: "S1->S3",
      name: c1.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1.from.stopName,
      departure: c1.from.departure,
      to: c1.to.stopName,
      arrival: c1.to.arrival,
      color: TEST_COLORS[0],
      status: "active",
    },
    {
      id: c1_alt1.id,
      leg: "S1->S3",
      name: c1_alt1.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1_alt1.from.stopName,
      departure: c1_alt1.from.departure,
      to: c1_alt1.to.stopName,
      arrival: c1_alt1.to.arrival,
      color: TEST_COLORS[0],
      status: "inactive",
    },
    {
      id: c1_alt2.id,
      leg: "S1->S3",
      name: c1_alt2.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1_alt2.from.stopName,
      departure: c1_alt2.from.departure,
      to: c1_alt2.to.stopName,
      arrival: c1_alt2.to.arrival,
      color: TEST_COLORS[0],
      status: "inactive",
    },
  ];

  expect(got).toStrictEqual(exp);
});

test("Multiple connections, some with alternatives", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c1_alt1 = _c("T4: S1@D2T10->S2@D2T11->S3@D2T12");
  const c1_alt2 = _c("T5: S1@D3T10->S2@D3T11->S3@D3T12");
  const c2 = _c("T2: S3@D1T12->S4@D1T13");
  const c3 = _c("T3: S4@D1T14->S5@D1T15");

  const i1 = new Itinerary([c1, c2, c3]);

  const alternatives = {};
  alternatives[c1.id] = [c1_alt1, c1_alt2];
  alternatives[c2.id] = null; // still loading
  alternatives[c3.id] = []; // no alternatives
  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      id: c1.id,
      leg: "S1->S3",
      name: c1.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1.from.stopName,
      departure: c1.from.departure,
      to: c1.to.stopName,
      arrival: c1.to.arrival,
      color: TEST_COLORS[0],
      status: "active",
    },
    {
      id: c1_alt1.id,
      leg: "S1->S3",
      name: c1_alt1.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1_alt1.from.stopName,
      departure: c1_alt1.from.departure,
      to: c1_alt1.to.stopName,
      arrival: c1_alt1.to.arrival,
      color: TEST_COLORS[0],
      status: "inactive",
    },
    {
      id: c1_alt2.id,
      leg: "S1->S3",
      name: c1_alt2.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c1_alt2.from.stopName,
      departure: c1_alt2.from.departure,
      to: c1_alt2.to.stopName,
      arrival: c1_alt2.to.arrival,
      color: TEST_COLORS[0],
      status: "inactive",
    },
    {
      id: c2.id,
      leg: "S3->S4",
      name: c2.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c2.from.stopName,
      departure: c2.from.departure,
      to: c2.to.stopName,
      arrival: c2.to.arrival,
      color: TEST_COLORS[1],
      status: "active-loading",
    },
    {
      id: c3.id,
      leg: "S4->S5",
      name: c3.name,
      icon: expect.stringMatching("RAIL.svg"),
      from: c3.from.stopName,
      departure: c3.from.departure,
      to: c3.to.stopName,
      arrival: c3.to.arrival,
      color: TEST_COLORS[2],
      status: "active",
    },
  ];
  expect(got).toStrictEqual(exp);
});
