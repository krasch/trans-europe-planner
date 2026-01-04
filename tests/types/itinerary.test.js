import { test, expect } from "vitest";

import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

import { connectionFromShorthand as _c } from "tests/_helpers/data.js";

test("Itinerary with one connection", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const itinerary = new Itinerary([c1]);

  expect(itinerary.from).toStrictEqual(c1.from);
  expect(itinerary.to).toStrictEqual(c1.to);
  expect(itinerary.vias).toStrictEqual([]);
  expect(itinerary.stopIds).toStrictEqual(["S1", "S2"]);
  expect(itinerary.id).toBe("S1->S2");
});

test("Itinerary with multiple connections", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c2 = _c("T2: S2@D1T12->S3@D1T14");
  const c3 = _c("T3: S3@D1T15->S4@D1T20");

  const itinerary = new Itinerary([c1, c2, c3]);

  const expVia1 = new Stop(
    c1.to.stopId,
    c1.to.stopName,
    c1.to.latitude,
    c1.to.longitude,
    c1.to.arrival,
    c2.from.departure,
  );

  const expVia2 = new Stop(
    c2.to.stopId,
    c2.to.stopName,
    c2.to.latitude,
    c2.to.longitude,
    c2.to.arrival,
    c3.from.departure,
  );

  expect(itinerary.from).toStrictEqual(c1.from);
  expect(itinerary.to).toStrictEqual(c3.to);
  expect(itinerary.vias).toStrictEqual([expVia1, expVia2]);
  expect(itinerary.stopIds).toStrictEqual(["S1", "S2", "S3", "S4"]);
  expect(itinerary.id).toBe("S1->S2->S3->S4");
});
