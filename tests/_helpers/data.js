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

export function getTestColor(idx) {
  return COLORS[idx];
}

export function timestampFromShorthand(tsShorthand) {
  // "D1T10"
  const split = tsShorthand.split("T");
  const day = Number(split[0].slice(1));
  const hour = Number(split[1]);

  return DAY1.plus({ days: day - 1, hours: hour }); // -1 because T1 should be Day1
}

// todo delete this or make different thing with city and station?
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

// todo different naming for stop and city
// todo add minute for departure
/**
 * @param {string} shorthand
 * @param {('first'|'intermediate'|'last')} type
 */
export function stopFromShorthand(shorthand, type = "intermediate") {
  // S1@D1T10
  const [id, tsShorthand] = shorthand.split("@");
  const timestamp = timestampFromShorthand(tsShorthand);

  let arrival = null;
  if (type !== "first") arrival = timestamp;

  let departure = null;
  if (type !== "last") departure = timestamp;

  const stopId = id;
  const stopName = id;
  const city = { id: id, name: id };

  return new Stop(stopId, stopName, city, arrival, departure);
}

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

export function itineraryFromShortHand(connectionShorthands) {
  return new Itinerary(connectionShorthands.map(connectionFromShorthand));
}
