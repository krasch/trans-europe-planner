import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";

import { Stop } from "/script/types/stop.js";
import { Connection } from "/script/types/connection.js";

export const DAY1 = DateTime.fromISO("2024-10-15");

export const COLORS = [
  "0, 255, 0",
  "255, 0, 0",
  "0, 0, 255",
  "255, 255, 0",
  "255, 0, 255",
];

export function getTestColor(idx) {
  return COLORS[idx];
}

export function timestampFromShorthand(tsShorthand) {
  // string has form "D1T10"
  const split = tsShorthand.split("T");
  const day = Number(split[0].slice(1));
  const hour = Number(split[1]);

  return DAY1.plus({ days: day - 1, hours: hour }); // -1 because T1 should be Day1
}

export function stopFromData(data) {
  return new Stop(
    data.stopId,
    data.stopName ?? data.stopId,
    {
      id: data.city ? data.city.id : data.stopId,
      name: data.city ? data.city.name : data.stopId,
    },
    // respect that arrival or departure can be null, todo also for all other attributes?
    data.arrival !== undefined ? data.arrival : data.departure,
    data.departure !== undefined ? data.departure : data.arrival,
  );
}

export function connectionFromData(data) {
  return new Connection(
    data.tripId,
    data.mode ?? "REGIONAL_RAIL",
    data.routeShortName ?? data.tripId,
    data.from,
    data.to,
    data.intermediate ?? [],
  );
}

export function connectionFromShorthand(shorthand) {
  // "T1: S1@D1T10->S2@D1T11->S3@D1T12"
  const [tripId, shorthandStops] = shorthand.split(": ");

  const stops = shorthandStops
    .split("->")
    .map((stop) => ({ id: stop.split("@")[0], ts: stop.split("@")[1] }));

  const from = stopFromData({
    stopId: stops[0].id,
    departure: timestampFromShorthand(stops[0].ts),
    arrival: null,
  });

  const to = stopFromData({
    stopId: stops.at(-1).id,
    departure: null,
    arrival: timestampFromShorthand(stops.at(-1).ts),
  });

  const intermediate = [];
  for (let i = 1; i < stops.length - 1; i++) {
    intermediate.push(
      stopFromData({
        stopId: stops.at(i).id,
        arrival: timestampFromShorthand(stops.at(i).ts),
        departure: timestampFromShorthand(stops.at(i).ts),
      }),
    );
  }

  return connectionFromData({
    tripId: tripId,
    from: from,
    to: to,
    intermediate: intermediate,
  });
}
