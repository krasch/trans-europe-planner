import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { intersection } from "script/util.js";

import {
  GeocodedLocation,
  parseMotisGeocodingStopResult,
  parseMotisItinerary,
} from "./parser.js";

const BASE_URL = "http://localhost:8080";
const REFERRER = "https://trans-europe-planner.eu";
const SEARCH_WINDOW = 3 * 24 * 60 * 60; // 3 days in seconds
const RAIL_MODES = [
  "RAIL",
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
];

export class MotisError extends Error {
  constructor(message) {
    super(message);
    this.name = "MotisError";
  }
}

/**
 * @param {String} path
 * @param {object} params
 * @returns {Promise<object>}
 */
async function query(path, params) {
  const url = new URL(path, BASE_URL);
  url.search = new URLSearchParams(params).toString();

  const response = await fetch(url, { referrer: REFERRER });
  if (!response.ok)
    throw new MotisError([response.status, response.statusText].join());

  return response.json();
}

/**
 * @param {GeocodedLocation} from
 * @param {GeocodedLocation} to
 * @param {DateTime} startDate
 * @returns {Promise<Itinerary[]>}
 */
export async function plan(from, to, startDate) {
  let fromLocation = `${from.latitude},${from.longitude}`;
  if (from.kind === "stop") fromLocation = from.id;

  let toLocation = `${to.latitude},${to.longitude}`;
  if (to.kind === "stop") toLocation = to.id;

  const result = await query("/api/v5/plan", {
    fromPlace: fromLocation,
    toPlace: toLocation,
    modes: RAIL_MODES,
    detailedTransfers: false,
    time: startDate.toISO(),
    searchWindow: SEARCH_WINDOW,
  });

  return result.itineraries.map(parseMotisItinerary);
}

/**
 * @param {String} fromStopId
 * @param {String} toStopId
 * @param {DateTime} startDate
 * @returns {Promise<Connection[]>}
 */
export async function direct(fromStopId, toStopId, startDate) {
  const result = await query("/api/v5/plan", {
    fromPlace: fromStopId,
    toPlace: toStopId,
    modes: RAIL_MODES,
    maxTransfers: 0,
    detailedTransfers: false,
    time: startDate.toISO(),
    searchWindow: SEARCH_WINDOW,
  });

  const itineraries = result.itineraries.map(parseMotisItinerary);
  return itineraries
    .filter((i) => i.vias.length === 0) // only want direct
    .map((i) => i.connections[0]); // only want the first (=only) connection
}

/**
 * @param {string} userInput
 * @returns {Promise<{stop: GeocodedLocation, place: GeocodedLocation | null}[]>}
 */
export async function geocode(userInput) {
  const results = await query("/api/v1/geocode", {
    text: userInput,
    language: "en",
    type: "STOP",
    mode: RAIL_MODES,
  });

  // extra filter because some non-rail stops show up in result
  return results
    .filter((r) => intersection(r.modes, RAIL_MODES).length > 0)
    .map(parseMotisGeocodingStopResult);
}

/**
 * @param {Number} latitude
 * @param {Number} longitude
 * @returns {Promise<String[]>} stopIds
 */
export async function reverseGeocode(latitude, longitude) {
  const results = await query("/api/v1/reverse-geocode", {
    place: `${latitude},${longitude}`,
    type: "STOP",
  });

  return results
    .filter((r) => intersection(r.modes, RAIL_MODES).length > 0)
    .map((r) => r.id);
}
