// @ts-expect-error TS2307
import { DateTime } from "external/luxon.js";

import { GeoDatabase } from "script/data/geoDatabase.js";
import { MotisClient } from "script/data/sources/motis.js";

import { DAY1 } from "tests/_helpers/data.js";

const CITIES = {
  fromCityId: { name: "fromCityName" },
  toCityId: { name: "toCityName" },
  transferCityId: { name: "transferCityName" },
  intermediateCity1Id: { name: "intermediateCity1Name" },
  intermediateCity2Id: { name: "intermediateCity2Name" },
};

const STOPS = {
  fromStopId: {
    name: "fromStopName",
    cityId: "fromCityId",
    motisIds: ["de:Region1:FromStopMotisId"],
  },
  toStopId: {
    name: "toStopName",
    cityId: "toCityId",
    motisIds: ["de:Region2:ToStopMotisId"],
  },
  transferStopId: {
    name: "transferStopName",
    cityId: "transferCityId",
    motisIds: ["de:Region1:TransferStopMotisId"],
  },
  intermediateStop1Id: {
    name: "intermediateStop1Name",
    cityId: "intermediateCity1Id",
    motisIds: ["irrelevantMotisId", "de:Region1:IntermediateStop1MotisId"],
  },
  intermediateStop2Id: {
    name: "intermediateStop2Name",
    cityId: "intermediateCity2Id",
    motisIds: ["de:Region1:IntermediateStop2MotisId"],
  },
};

// this is an actual motis response, with many fields removed and using fake stop ids
// there are two itineraries, both for fromCity->toCity
// the first itinerary has two connections (fromCity->transferCity, transferCity->toCity)
// the second itinerary is a direct connection (fromCity->toCity)
const MOTIS_RESPONSE = {
  itineraries: [
    {
      legs: [
        {
          mode: "REGIONAL_RAIL",
          from: {
            stopId: "de:Region1:FromStopMotisId:1:2",
            scheduledDeparture: "2025-08-01T03:48:00Z",
          },
          to: {
            stopId: "de:Region1:TransferStopMotisId:3:7",
            scheduledArrival: "2025-08-01T04:50:00Z",
          },
          tripId: "tripId1",
          routeShortName: "RE1",
          intermediateStops: [
            {
              stopId: "de:Region1:IntermediateStopMotisId1:1:1",
              scheduledArrival: "2025-08-01T03:58:00Z",
              scheduledDeparture: "2025-08-01T04:03:00Z",
            },
            {
              stopId: "de:Region1:IntermediateStopMotisId2:13:1",
              scheduledArrival: "2025-08-01T04:09:00Z",
              scheduledDeparture: "2025-08-01T04:10:00Z",
            },
          ],
        },
        {
          mode: "WALK",
          from: {
            stopId: "de:Region1:TransferStopMotisId:3:7",
          },
          to: {
            stopId: "de:Region1:TransferStopMotisId:3:4",
          },
        },
        {
          mode: "REGIONAL_RAIL",
          from: {
            stopId: "de:Region1:TransferStopMotisId:3:4",
            scheduledDeparture: "2025-08-01T05:00:00Z",
          },
          to: {
            stopId: "de:Region2:ToStopMotisId:1:1",
            scheduledArrival: "2025-08-01T05:58:00Z",
          },
          tripId: "tripId2",
          routeShortName: "RE9",
          intermediateStops: [],
        },
      ],
    },
    {
      legs: [
        {
          mode: "REGIONAL_RAIL",
          from: {
            stopId: "de:Region1:FromStopMotisId",
            scheduledDeparture: "2025-08-01T03:48:00Z",
          },
          to: {
            stopId: "de:Region2:ToStopMotisId",
            scheduledArrival: "2025-08-01T04:50:00Z",
          },
          tripId: "tripId3",
          routeShortName: "SuperRE",
          intermediateStops: [],
        },
      ],
    },
  ],
};

beforeEach(async () => {
  // mock fetch to always return the fake motis response defined above
  global.fetch = async () =>
    // @ts-expect-error 2322
    Promise.resolve({ ok: true, json: () => Promise.resolve(MOTIS_RESPONSE) });
});

test("Plan itinerary using motis and parse result", async function () {
  const geoDatabase = new GeoDatabase(CITIES, STOPS);

  const client = new MotisClient();
  const got = await client.plan(
    "fromCityId",
    "toCityId",
    DAY1, // irrelevant because of mocking, just needs to be any DateTime object
    geoDatabase,
  );

  const expConnection1 = {
    id: "tripId1XXXfromStopIdXXXtransferStopId",
    mode: "REGIONAL_RAIL",
    name: "RE1",
    from: {
      stopId: "fromStopId",
      stopName: STOPS.fromStopId.name,
      city: { id: "fromCityId", name: CITIES.fromCityId.name },
      arrival: null,
      departure: DateTime.fromISO("2025-08-01T03:48:00Z"),
    },
    to: {
      stopId: "transferStopId",
      stopName: STOPS.transferStopId.name,
      city: { id: "transferCityId", name: CITIES.transferCityId.name },
      arrival: DateTime.fromISO("2025-08-01T04:50:00Z"),
      departure: null,
    },
    intermediateStops: [], // todo not implemented yet
  };

  const expConnection2 = {
    id: "tripId2XXXtransferStopIdXXXtoStopId",
    mode: "REGIONAL_RAIL",
    name: "RE9",
    from: {
      stopId: "transferStopId",
      stopName: STOPS.transferStopId.name,
      city: { id: "transferCityId", name: CITIES.transferCityId.name },
      arrival: null,
      departure: DateTime.fromISO("2025-08-01T05:00:00Z"),
    },
    to: {
      stopId: "toStopId",
      stopName: STOPS.toStopId.name,
      city: { id: "toCityId", name: CITIES.toCityId.name },
      arrival: DateTime.fromISO("2025-08-01T05:58:00Z"),
      departure: null,
    },
    intermediateStops: [],
  };

  const expConnection3 = {
    id: "tripId3XXXfromStopIdXXXtoStopId",
    mode: "REGIONAL_RAIL",
    name: "SuperRE",
    from: {
      stopId: "fromStopId",
      stopName: STOPS.fromStopId.name,
      city: { id: "fromCityId", name: CITIES.fromCityId.name },
      arrival: null,
      departure: DateTime.fromISO("2025-08-01T03:48:00Z"),
    },
    to: {
      stopId: "toStopId",
      stopName: STOPS.toStopId.name,
      city: { id: "toCityId", name: CITIES.toCityId.name },
      arrival: DateTime.fromISO("2025-08-01T04:50:00Z"),
      departure: null,
    },
  };

  const exp = [
    { connections: [expConnection1, expConnection2] },
    { connections: [expConnection3] },
  ];

  expect(got).toMatchObject(exp);
});

test("Get direct connections using motis", async function () {
  const geoDatabase = new GeoDatabase(CITIES, STOPS);

  const client = new MotisClient();
  const got = await client.direct(
    "fromCityId",
    "toCityId",
    DAY1, // irrelevant because of mocking, just needs to be any DateTime object
    geoDatabase,
  );

  // the motis response from above only contains one matching direct connection
  const exp = [
    {
      id: "tripId3XXXfromStopIdXXXtoStopId",
      mode: "REGIONAL_RAIL",
      name: "SuperRE",
      from: {
        stopId: "fromStopId",
        stopName: STOPS.fromStopId.name,
        city: { id: "fromCityId", name: CITIES.fromCityId.name },
        arrival: null,
        departure: DateTime.fromISO("2025-08-01T03:48:00Z"),
      },
      to: {
        stopId: "toStopId",
        stopName: STOPS.toStopId.name,
        city: { id: "toCityId", name: CITIES.toCityId.name },
        arrival: DateTime.fromISO("2025-08-01T04:50:00Z"),
        departure: null,
      },
    },
  ];

  expect(got).toMatchObject(exp);
});
