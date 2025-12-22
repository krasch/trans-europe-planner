/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect } from "vitest";

import { prepareDataForCalendar } from "script/data/components/calendar.js";
import { Itinerary } from "script/types/itinerary.js";

import {
  getTestColor as _color,
  connectionFromShorthand as _c,
} from "tests/_helpers/data.js";
import { initTestDOM } from "tests/_helpers/domUtils.js";

beforeEach(async () => {
  initTestDOM(); // needed to get connection colors from css
});

test("prepareDataForCalenderNotActive", function () {
  const got = prepareDataForCalendar(null, []);
  expect(got).toStrictEqual([]);
});

test("prepareDataForCalenderOneConnectionNoAlternatives", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const i1 = new Itinerary([c1]);

  const alternatives = [[]];
  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      uniqueId: c1.id,
      leg: "C1->C3",
      name: c1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1.from.stopName,
      startDateTime: c1.from.departure,
      endStation: c1.to.stopName,
      endDateTime: c1.to.arrival,
      color: _color(0),
      selected: true,
    },
  ];

  expect(got).toStrictEqual(exp);
});

test("prepareDataForCalenderOneConnectionWithAlternatives", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c1_alt1 = _c("T2: S1@D2T10->S2@D2T11->S3@D2T12");
  const c1_alt2 = _c("T3: S1@D3T10->S2@D3T11->S3@D3T12");

  const i1 = new Itinerary([c1]);
  const alternatives = [[c1_alt1, c1_alt2]];
  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      uniqueId: c1.id,
      leg: "C1->C3",
      name: c1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1.from.stopName,
      startDateTime: c1.from.departure,
      endStation: c1.to.stopName,
      endDateTime: c1.to.arrival,
      color: _color(0),
      selected: true,
    },
    {
      uniqueId: c1_alt1.id,
      leg: "C1->C3",
      name: c1_alt1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1_alt1.from.stopName,
      startDateTime: c1_alt1.from.departure,
      endStation: c1_alt1.to.stopName,
      endDateTime: c1_alt1.to.arrival,
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c1_alt2.id,
      leg: "C1->C3",
      name: c1_alt2.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1_alt2.from.stopName,
      startDateTime: c1_alt2.from.departure,
      endStation: c1_alt2.to.stopName,
      endDateTime: c1_alt2.to.arrival,
      color: _color(0),
      selected: false,
    },
  ];
  expect(got).toStrictEqual(exp);
});

test("prepareDataForCalenderMultipleConnectionsWithAlternatives", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c2 = _c("T2: S3@D1T12->S4@D1T13");
  const c3 = _c("T3: S4@D1T14->S5@D1T15");

  const c1_alt1 = _c("T4: S1@D2T10->S2@D2T11->S3@D2T12");
  const c1_alt2 = _c("T5: S1@D3T10->S2@D3T11->S3@D3T12");
  const c3_alt1 = _c("T6: S4@D3T14->S5@D3T15");

  const i1 = new Itinerary([c1, c2, c3]);
  const alternatives = [[c1_alt1, c1_alt2], [], [c3_alt1]];
  const got = prepareDataForCalendar(i1, alternatives);

  const exp = [
    {
      uniqueId: c1.id,
      leg: "C1->C3",
      name: c1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1.from.stopName,
      startDateTime: c1.from.departure,
      endStation: c1.to.stopName,
      endDateTime: c1.to.arrival,
      color: _color(0),
      selected: true,
    },
    {
      uniqueId: c1_alt1.id,
      leg: "C1->C3",
      name: c1_alt1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1_alt1.from.stopName,
      startDateTime: c1_alt1.from.departure,
      endStation: c1_alt1.to.stopName,
      endDateTime: c1_alt1.to.arrival,
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c1_alt2.id,
      leg: "C1->C3",
      name: c1_alt2.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c1_alt2.from.stopName,
      startDateTime: c1_alt2.from.departure,
      endStation: c1_alt2.to.stopName,
      endDateTime: c1_alt2.to.arrival,
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c2.id,
      leg: "C3->C4",
      name: c2.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c2.from.stopName,
      startDateTime: c2.from.departure,
      endStation: c2.to.stopName,
      endDateTime: c2.to.arrival,
      color: _color(1),
      selected: true,
    },
    {
      uniqueId: c3.id,
      leg: "C4->C5",
      name: c3.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c3.from.stopName,
      startDateTime: c3.from.departure,
      endStation: c3.to.stopName,
      endDateTime: c3.to.arrival,
      color: _color(2),
      selected: true,
    },
    {
      uniqueId: c3_alt1.id,
      leg: "C4->C5",
      name: c3_alt1.name,
      icon: expect.stringMatching("train.svg"),
      startStation: c3_alt1.from.stopName,
      startDateTime: c3_alt1.from.departure,
      endStation: c3_alt1.to.stopName,
      endDateTime: c3_alt1.to.arrival,
      color: _color(2),
      selected: false,
    },
  ];
  expect(got).toStrictEqual(exp);
});
