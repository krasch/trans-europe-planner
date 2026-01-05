import assert from "assert";

import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

export const DAY1 = DateTime.fromISO("2024-10-15");

export const TEST_COLORS = [
  "0, 255, 0",
  "255, 0, 0",
  "0, 0, 255",
  "255, 255, 0",
  "255, 0, 255",
];

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
 * @returns Stop
 */
export function stopFromShorthand(shorthand) {
  // S1@D1T10
  const [id, tsShorthand] = shorthand.split("@");
  assert(id.match("S[0-9]+"), "Bad stopId format");

  const stopNumber = id.slice(1); // remove the initial "S"
  const timestamp = timestampFromShorthand(tsShorthand);

  // IMPORTANT: departure is always 1 minute later than arrival to make tests stronger
  const arrival = timestamp;
  const departure = timestamp.plus({ minute: 1 });

  // stop S1 with name Stop1, city C1 with name City1
  const stopId = `S${stopNumber}`;
  const stopName = `Stop${stopNumber}`;

  const latitude = Number(stopNumber) * 10;
  const longitude = Number(stopNumber) * 10;

  return new Stop(stopId, stopName, latitude, longitude, arrival, departure);
}

/**
 * @param {string} shorthand
 * @returns Connection
 */
export function connectionFromShorthand(shorthand) {
  // "T1: S1@D1T10->S2@D1T11->S3@D1T12"
  const [tripId, stopListString] = shorthand.split(": ");

  const stops = stopListString.split("->").map((s) => stopFromShorthand(s));

  const from = stops[0];
  const to = stops.at(-1);
  const intermediate = stops.slice(1, -1);

  from.arrival = null;
  to.departure = null;

  const mode = "REGIONAL_RAIL";
  const name = `ICE ${tripId}`;

  return new Connection(tripId, mode, name, from, to, intermediate);
}

/**
 * @param {string[]} connectionShorthands
 * @returns Itinerary
 */
export function itineraryFromShortHand(connectionShorthands) {
  return new Itinerary(connectionShorthands.map(connectionFromShorthand));
}
