import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

const BASE_URL = "http://localhost:8080";
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
 * @param {Object} motisStop
 * @returns {Stop}
 */
function parseMotisStop(motisStop) {
  let stopId = motisStop.stopId;
  if (motisStop.parentId) stopId = motisStop.parentId;

  let arrival = null;
  if (motisStop.scheduledArrival)
    arrival = DateTime.fromISO(motisStop.scheduledArrival);

  let departure = null;
  if (motisStop.scheduledDeparture)
    departure = DateTime.fromISO(motisStop.scheduledDeparture);

  return new Stop(
    stopId,
    motisStop.name,
    motisStop.lat,
    motisStop.lon,
    arrival,
    departure,
  );
}

/**
 * @param {Object} motisLeg
 * @returns {Connection}
 */
function parseMotisConnection(motisLeg) {
  const from = parseMotisStop(motisLeg.from);
  const to = parseMotisStop(motisLeg.to);
  const intermediate = motisLeg.intermediateStops.map(parseMotisStop);

  return new Connection(
    motisLeg.tripId,
    motisLeg.mode,
    motisLeg.routeShortName,
    from,
    to,
    intermediate,
  );
}

/**
 * @param {Object} motisItinerary
 * @returns {Itinerary}
 */
function parseMotisItinerary(motisItinerary) {
  // remove walk legs
  const legs = motisItinerary.legs.filter((l) => l.mode !== "WALK");
  return new Itinerary(legs.map(parseMotisConnection));
}

export class MotisClient {
  constructURL(path, params) {
    const url = new URL(path, BASE_URL);
    url.search = new URLSearchParams(params).toString();
    return url;
  }

  /**
   * @param {String} from -- stopId or lat,lon
   * @param {String} to -- stopId or lat,lon
   * @param {DateTime} startDate
   * @returns {Promise<Itinerary[]>}
   */
  async plan(from, to, startDate) {
    const url = this.constructURL("/api/v5/plan", {
      fromPlace: from,
      toPlace: to,
      detailedTransfers: false,
      transitModes: TRANSIT_MODES,
      time: startDate.toISO(),
      searchWindow: SEARCH_WINDOW,
    });

    const response = await fetch(url);
    if (!response.ok)
      throw new MotisError([response.status, response.statusText].join());

    const data = await response.json();
    return data.itineraries.map(parseMotisItinerary);
  }

  /**
   * @param {String} fromStopId
   * @param {String} toStopId
   * @param {DateTime} startDate
   * @returns {Promise<Connection[]>}
   */
  async direct(fromStopId, toStopId, startDate) {
    const itineraries = await this.plan(fromStopId, toStopId, startDate);

    return itineraries
      .filter((i) => i.vias.length === 0) // only want direct
      .map((i) => i.connections[0]); // only want the first (=only) connection
  }

  /**
   * @param {string} userInput
   * @returns {Promise<{name: string, location: string}[]>}
   */
  async geocodePlace(userInput) {
    const url = this.constructURL("/api/v1/geocode", {
      text: userInput,
      language: "en",
      type: "PLACE",
    });

    const response = await fetch(url);
    if (!response.ok)
      throw new MotisError([response.status, response.statusText].join());

    const results = await response.json();

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
  async geocodeStop(userInput) {
    const url = this.constructURL("/api/v1/geocode", {
      text: userInput,
      language: "en",
      type: "STOP",
      mode: TRANSIT_MODES,
    });

    const response = await fetch(url);
    if (!response.ok)
      throw new MotisError([response.status, response.statusText].join());

    const results = await response.json();
    return results.map((stop) => ({
      name: stop.name,
      location: stop.id,
    }));
  }
}
