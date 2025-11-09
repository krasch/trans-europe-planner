import assert from "assert";

import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

export const DAY1 = DateTime.fromISO("2024-10-15");

export const COLORS = [
  "0, 255, 0",
  "255, 0, 0",
  "0, 0, 255",
  "255, 255, 0",
  "255, 0, 255",
];

/**
 * @param {number} idx
 * @returns string
 */
export function getTestColor(idx) {
  return COLORS[idx];
}

/**
 * @param {string} tsShorthand
 * @returns DateTime
 */
export function timestampFromShorthand(tsShorthand) {
  // "D1T10"
  assert(tsShorthand.match("D[0-9]T[0-9][0-9]"), "Bad timestamp format");

  const split = tsShorthand.split("T");
  const day = Number(split[0].slice(1)); // todo check for D
  const hour = Number(split[1]);

  return DAY1.plus({ days: day - 1, hours: hour }); // -1 because T1 should be Day1
}

/**
 * @param {string} shorthand
 * @param {('first'|'intermediate'|'last')} type
 * @returns Stop
 */
export function stopFromShorthand(shorthand, type = "intermediate") {
  // S1@D1T10
  const [id, tsShorthand] = shorthand.split("@");
  assert(id.match("S[0-9]+"), "Bad stopId format");

  const stopNumber = id.slice(1); // remove the initial "S"
  const timestamp = timestampFromShorthand(tsShorthand);

  let arrival = null;
  if (type !== "first") arrival = timestamp;

  // IMPORTANT: departure is always 1 minute later than arrival to make tests stronger
  let departure = null;
  if (type !== "last") departure = timestamp.plus({ minute: 1 });

  // stop S1 with name Stop1, city C1 with name City1
  const stopId = `S${stopNumber}`;
  const stopName = `Stop${stopNumber}`;
  const cityId = `C${stopNumber}`;
  const cityName = `City${stopNumber}`;

  return new Stop(
    stopId,
    stopName,
    { id: cityId, name: cityName },
    arrival,
    departure,
  );
}

// todo remove
export function connectionFromData(data) {
  return new Connection(
    data.tripId,
    data.mode ?? "REGIONAL_RAIL",
    data.routeShortName ?? `ICE ${data.tripId}`,
    data.from,
    data.to,
    data.intermediate ?? [],
  );
}

/**
 * @param {string} shorthand
 * @returns Connection
 */
export function connectionFromShorthand(shorthand) {
  // "T1: S1@D1T10->S2@D1T11->S3@D1T12"
  const [tripId, stopListString] = shorthand.split(": ");
  const stops = stopListString.split("->");

  const from = stopFromShorthand(stops[0], "first");
  const to = stopFromShorthand(stops.at(-1), "last");

  const intermediate = stops
    .slice(1, -1)
    .map((s) => stopFromShorthand(s, "intermediate"));

  return connectionFromData({
    tripId: tripId,
    from: from,
    to: to,
    intermediate: intermediate,
  });
}

/**
 * @param {string[]} connectionShorthands
 * @returns Itinerary
 */
export function itineraryFromShortHand(connectionShorthands) {
  return new Itinerary(connectionShorthands.map(connectionFromShorthand));
}
