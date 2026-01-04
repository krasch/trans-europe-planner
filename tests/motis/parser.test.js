import { test, expect } from "vitest";

import { parseMotisItinerary } from "script/motis/parser.js";

import { DAY1 } from "tests/_helpers/data.js";
import { itineraryFromShortHand as _i } from "tests/_helpers/data.js";

test("Parse itinerary with just one connection, no intermediate stops", function () {
  const motisItinerary = {
    legs: [
      {
        mode: "REGIONAL_RAIL",
        tripId: "T1",
        displayName: "ICE T1",
        from: {
          stopId: "S1",
          name: "Stop1",
          lat: 10,
          lon: 10,
          scheduledDeparture: DAY1.plus({ hours: 10, minutes: 1 }),
        },
        to: {
          stopId: "S2",
          name: "Stop2",
          lat: 20,
          lon: 20,
          scheduledArrival: DAY1.plus({ hours: 11 }),
        },
        intermediateStops: [],
      },
    ],
  };

  const got = parseMotisItinerary(motisItinerary);
  const exp = _i(["T1: S1@D1T10->S2@D1T11"]);

  expect(got).toStrictEqual(exp);
});

test("Parse itinerary with just one connection, with intermediate stops", function () {
  const motisItinerary = {
    legs: [
      {
        mode: "REGIONAL_RAIL",
        tripId: "T2",
        displayName: "ICE T2",
        from: {
          stopId: "S1",
          name: "Stop1",
          lat: 10,
          lon: 10,
          scheduledDeparture: DAY1.plus({ hours: 10, minutes: 1 }),
        },
        to: {
          stopId: "S4",
          name: "Stop4",
          lat: 40,
          lon: 40,
          scheduledArrival: DAY1.plus({ hours: 14 }),
        },
        intermediateStops: [
          {
            stopId: "S2",
            name: "Stop2",
            lat: 20,
            lon: 20,
            scheduledArrival: DAY1.plus({ hours: 12 }),
            scheduledDeparture: DAY1.plus({ hours: 12, minutes: 1 }),
          },
          {
            stopId: "S3",
            name: "Stop3",
            lat: 30,
            lon: 30,
            scheduledArrival: DAY1.plus({ hours: 13 }),
            scheduledDeparture: DAY1.plus({ hours: 13, minutes: 1 }),
          },
        ],
      },
    ],
  };

  const got = parseMotisItinerary(motisItinerary);
  const exp = _i(["T2: S1@D1T10->S2@D1T12->S3@D1T13->S4@D1T14"]);

  expect(got).toStrictEqual(exp);
});

test("Parse itinerary with multiple connections and WALK leg", function () {
  const motisItinerary = {
    legs: [
      {
        mode: "REGIONAL_RAIL",
        tripId: "T2",
        displayName: "ICE T2",
        from: {
          stopId: "S1",
          name: "Stop1",
          lat: 10,
          lon: 10,
          scheduledDeparture: DAY1.plus({ hours: 10, minutes: 1 }),
        },
        to: {
          stopId: "S4",
          name: "Stop4",
          lat: 40,
          lon: 40,
          scheduledArrival: DAY1.plus({ hours: 14 }),
        },
        intermediateStops: [
          {
            stopId: "S2",
            name: "Stop2",
            lat: 20,
            lon: 20,
            scheduledArrival: DAY1.plus({ hours: 12 }),
            scheduledDeparture: DAY1.plus({ hours: 12, minutes: 1 }),
          },
          {
            stopId: "S3",
            name: "Stop3",
            lat: 30,
            lon: 30,
            scheduledArrival: DAY1.plus({ hours: 13 }),
            scheduledDeparture: DAY1.plus({ hours: 13, minutes: 1 }),
          },
        ],
      },
      {
        mode: "WALK",
        from: {
          stopId: "S4",
        },
        to: {
          stopId: "S5",
        },
      },
      {
        mode: "REGIONAL_RAIL",
        tripId: "T3",
        displayName: "ICE T3",
        from: {
          stopId: "S4",
          name: "Stop4",
          lat: 40,
          lon: 40,
          scheduledDeparture: DAY1.plus({ days: 1, hours: 7, minutes: 1 }),
        },
        to: {
          stopId: "S5",
          name: "Stop5",
          lat: 50,
          lon: 50,
          scheduledArrival: DAY1.plus({ day: 1, hours: 14 }),
        },
        intermediateStops: [],
      },
    ],
  };

  const got = parseMotisItinerary(motisItinerary);
  const exp = _i([
    "T2: S1@D1T10->S2@D1T12->S3@D1T13->S4@D1T14",
    "T3: S4@D2T07->S5@D2T14",
  ]);

  expect(got).toStrictEqual(exp);
});
