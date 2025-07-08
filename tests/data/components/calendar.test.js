/**
 * @jest-environment jsdom
 */

import { prepareDataForCalendar } from "/script/data/components/calendar.js";
import { initTestDOM } from "/tests/_helpers/domUtils.js";
import {
  getTestColor as _color,
  connectionFromShorthand as _c,
  timestampFromShorthand,
} from "/tests/_helpers/data.js";
import { Itinerary } from "/script/types/itinerary.js";

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
      leg: "S1->S3",
      name: "T1",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D1T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D1T12"),
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
      leg: "S1->S3",
      name: "T1",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D1T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D1T12"),
      color: _color(0),
      selected: true,
    },
    {
      uniqueId: c1_alt1.id,
      leg: "S1->S3",
      name: "T2",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D2T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D2T12"),
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c1_alt2.id,
      leg: "S1->S3",
      name: "T3",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D3T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D3T12"),
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
      leg: "S1->S3",
      name: "T1",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D1T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D1T12"),
      color: _color(0),
      selected: true,
    },
    {
      uniqueId: c1_alt1.id,
      leg: "S1->S3",
      name: "T4",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D2T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D2T12"),
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c1_alt2.id,
      leg: "S1->S3",
      name: "T5",
      icon: expect.stringMatching("train.svg"),
      startStation: "S1",
      startDateTime: timestampFromShorthand("D3T10"),
      endStation: "S3",
      endDateTime: timestampFromShorthand("D3T12"),
      color: _color(0),
      selected: false,
    },
    {
      uniqueId: c2.id,
      leg: "S3->S4",
      name: "T2",
      icon: expect.stringMatching("train.svg"),
      startStation: "S3",
      startDateTime: timestampFromShorthand("D1T12"),
      endStation: "S4",
      endDateTime: timestampFromShorthand("D1T13"),
      color: _color(1),
      selected: true,
    },
    {
      uniqueId: c3.id,
      leg: "S4->S5",
      name: "T3",
      icon: expect.stringMatching("train.svg"),
      startStation: "S4",
      startDateTime: timestampFromShorthand("D1T14"),
      endStation: "S5",
      endDateTime: timestampFromShorthand("D1T15"),
      color: _color(2),
      selected: true,
    },
    {
      uniqueId: c3_alt1.id,
      leg: "S4->S5",
      name: "T6",
      icon: expect.stringMatching("train.svg"),
      startStation: "S4",
      startDateTime: timestampFromShorthand("D3T14"),
      endStation: "S5",
      endDateTime: timestampFromShorthand("D3T15"),
      color: _color(2),
      selected: false,
    },
  ];
  expect(got).toStrictEqual(exp);
});
