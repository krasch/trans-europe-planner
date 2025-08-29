import {
  stopFromData as _s,
  timestampFromShorthand as _ts,
  connectionFromData as _c,
} from "/tests/_helpers/data.js";
import { Itinerary } from "/script/types/itinerary.js";

test("Itinerary with one connection", function () {
  const c1 = _c({
    tripId: "T1",
    from: _s({ stopId: "S1", cityId: "C1", departure: _ts("D1T10") }),
    to: _s({ stopId: "S2", cityId: "C2", arrival: _ts("D1T11") }),
  });

  const itinerary = new Itinerary([c1]);

  expect(itinerary.from).toStrictEqual(c1.from);
  expect(itinerary.to).toStrictEqual(c1.to);
  expect(itinerary.vias).toStrictEqual([]);
  expect(itinerary.cities).toStrictEqual([c1.from.city, c1.to.city]);
});

test("Itinerary with multiple connections", function () {
  const c1 = _c({
    tripId: "T1",
    from: _s({ stopId: "S1", cityId: "C1", departure: _ts("D1T10") }),
    to: _s({ stopId: "S2", cityId: "C2", arrival: _ts("D1T11") }),
  });

  const c2 = _c({
    tripId: "T2",
    from: _s({ stopId: "S2", cityId: "C2", departure: _ts("D1T12") }),
    to: _s({ stopId: "S3", cityId: "C3", arrival: _ts("D1T14") }),
  });

  const c3 = _c({
    tripId: "T3",
    from: _s({ stopId: "S3", cityId: "C3", departure: _ts("D1T15") }),
    to: _s({ stopId: "S4", cityId: "C4", arrival: _ts("D1T20") }),
  });

  const itinerary = new Itinerary([c1, c2, c3]);

  const expVia1 = _s({
    stopId: c1.to.stopId,
    stopName: c1.to.stopName,
    city: c1.to.city,
    arrival: c1.to.arrival,
    departure: c2.from.departure,
  });

  const expVia2 = _s({
    stopId: c2.to.stopId,
    stopName: c2.to.stopName,
    city: c2.to.city,
    arrival: c2.to.arrival,
    departure: c3.from.departure,
  });

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
