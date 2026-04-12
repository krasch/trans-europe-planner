import { MOTIS_URL } from "app/config.js";
import {
  parseMotisGeocodingStopResult,
  parseMotisItinerary,
} from "app/data/motis/parser.js";
import { Connection } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";
import { Stop } from "app/types/stop.js";
import { intersection } from "app/utils/collections.js";

const REFERRER = "https://trans-europe-planner.eu";

const NUM_DAYS_PLAN = 1;
const NUM_DAYS_DIRECT = 3;

const RAIL_MODES = [
  "RAIL",
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
];

export class ErrorQueryingMotis extends Error {
  constructor(message) {
    super(message);
    this.name = "ErrorQueryingMotis";
  }
}

/**
 * @param {String} path
 * @param {object} params
 * @returns {Promise<object>}
 */
export async function query(path, params) {
  const url = new URL(path, MOTIS_URL);
  url.search = new URLSearchParams(params).toString();

  let response = null;

  try {
    response = await fetch(url, { referrer: REFERRER });
  } catch (error) {
    throw new ErrorQueryingMotis(error.message);
  }

  if (!response.ok)
    throw new ErrorQueryingMotis([response.status, response.statusText].join());

  return response.json();
}

/**
 * @param {string} fromStopId
 * @param {string} toStopId
 * @param {DateTime} startDate
 * @returns {Promise<Itinerary[]>}
 */
export async function plan(fromStopId, toStopId, startDate) {
  const result = await query("/api/v5/plan", {
    fromPlace: fromStopId,
    toPlace: toStopId,
    transitModes: RAIL_MODES,
    detailedTransfers: false,
    time: startDate.startOf("day").toISO(),
    searchWindow: NUM_DAYS_PLAN * 24 * 60 * 60, // in seconds
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
    transitModes: RAIL_MODES,
    maxTransfers: 0,
    detailedTransfers: false,
    time: startDate.startOf("day").toISO(),
    searchWindow: NUM_DAYS_DIRECT * 24 * 60 * 60, // in seconds
  });

  const itineraries = result.itineraries.map(parseMotisItinerary);
  return itineraries
    .filter((i) => i.vias.length === 0) // only want direct
    .map((i) => i.connections[0]); // only want the first (=only) connection in itinerary
}

/**
 * @param {string} userInput
 * @returns {Promise<Stop[]>}
 */
export async function geocode(userInput) {
  const results = await query("/api/v1/geocode", {
    text: userInput,
    language: "en",
    type: "STOP", // for now only allowing stops, not places
    mode: RAIL_MODES,
  });

  // extra filter because some non-rail stops show up in result
  return results
    .filter((r) => intersection(r.modes, RAIL_MODES).length > 0)
    .map(parseMotisGeocodingStopResult);
}

/**
 * // todo unittest
 * @param {String} stopId
 * @returns Stop
 */
export async function getStopInfo(stopId) {
  // workaround
  const results = await query("/api/v5/stoptimes", {
    stopId: stopId,
    n: 1,
  });

  // todo why is this using place?
  return new Stop(
    stopId,
    results.place.name,
    results.place.lat,
    results.place.lon,
  );
}
