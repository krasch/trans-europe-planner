import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

import {
  stopFromShorthand as _s,
  connectionFromShorthand as _c,
} from "tests/_helpers/data.js";

test("Itinerary with one connection", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const itinerary = new Itinerary([c1]);

  expect(itinerary.from).toStrictEqual(c1.from);
  expect(itinerary.to).toStrictEqual(c1.to);
  expect(itinerary.vias).toStrictEqual([]);
  expect(itinerary.cities).toStrictEqual([c1.from.city, c1.to.city]);
});

test("Itinerary with multiple connections", function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11");
  const c2 = _c("T2: S2@D1T12->S3@D1T14");
  const c3 = _c("T3: S3@D1T15->S2@D1T20");

  const itinerary = new Itinerary([c1, c2, c3]);

  const expVia1 = new Stop(
    c1.to.stopId,
    c1.to.stopName,
    c1.to.city,
    c1.to.arrival,
    c2.from.departure,
  );

  const expVia2 = new Stop(
    c2.to.stopId,
    c2.to.stopName,
    c2.to.city,
    c2.to.arrival,
    c3.from.departure,
  );

  expect(itinerary.from).toStrictEqual(c1.from);
  expect(itinerary.to).toStrictEqual(c3.to);
  expect(itinerary.vias).toStrictEqual([expVia1, expVia2]);
  expect(itinerary.cities).toStrictEqual([
    c1.from.city,
    expVia1.city,
    expVia2.city,
    c3.to.city,
  ]);
});
