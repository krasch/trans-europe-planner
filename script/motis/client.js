import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";

import { parseMotisItinerary } from "./parser.js";

const BASE_URL = "http://localhost:8080";
const REFERRER = "http://trans-europe-planner.eu";
const SEARCH_WINDOW = 3 * 24 * 60 * 60; // 3 days in seconds
const TRANSIT_MODES = [
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
 * @param {String} from -- stopId or lat,lon
 * @param {String} to -- stopId or lat,lon
 * @param {DateTime} startDate
 * @returns {Promise<Itinerary[]>}
 */
export async function plan(from, to, startDate) {
  const result = await query("/api/v5/plan", {
    fromPlace: from,
    toPlace: to,
    detailedTransfers: false,
    transitModes: TRANSIT_MODES,
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
  // todo make plan request with no transfers allowed
  const itineraries = await plan(fromStopId, toStopId, startDate);

  return itineraries
    .filter((i) => i.vias.length === 0) // only want direct
    .map((i) => i.connections[0]); // only want the first (=only) connection
}

/**
 * @param {string} userInput
 * @returns {Promise<{name: string, location: string}[]>}
 */
export async function geocodePlace(userInput) {
  const results = await query("/api/v1/geocode", {
    text: userInput,
    language: "en",
    type: "PLACE",
  });

  /* todo clean this up, do edit distance */
  const converted = [];
  const doneAreas = [];
  for (let place of results) {
    const areas = place.areas.filter(
      (area) => area.default && area.name.toLowerCase().startsWith(userInput),
    );
    if (areas.length === 0) continue;
    if (doneAreas.includes(areas[0].name)) continue;

    converted.push({
      name: areas[0].name,
      location: `${place.lat},${place.lon}`,
    });
    doneAreas.push(areas[0].name);
  }

  return converted;
}

/**
 * @param {string} userInput
 * @returns {Promise<{name: string, location: string}[]>}
 */
export async function geocodeStop(userInput) {
  const results = await query("/api/v1/geocode", {
    text: userInput,
    language: "en",
    type: "STOP",
    mode: TRANSIT_MODES,
  });

  return results.map((stop) => ({
    name: stop.name,
    location: stop.id,
  }));
}
