import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop, StopPlace } from "script/types/stop.js";

const BASE_URL = "http://localhost:8080";
const SEARCH_WINDOW = 3 * 24 * 60 * 60; // 3 days in seconds
const TRANSIT_MODES = [
  "RAIL",
  "HIGHSPEED_RAIL",
  "LONG_DISTANCE",
  "NIGHT_RAIL",
  "REGIONAL_FAST_RAIL",
  "REGIONAL_RAIL",
].join(",");

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
   * @param {String} fromStopId
   * @param {String} toStopId
   * @param {DateTime} startDate
   * @returns {Promise<Itinerary[]>}
   */
  async plan(fromStopId, toStopId, startDate) {
    const url = this.constructURL("/api/v5/plan", {
      fromPlace: fromStopId,
      toPlace: toStopId,
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
   * @param {String} userInput
   * @returns {Promise<StopPlace[]>}
   */
  async geocode(userInput) {
    const url = this.constructURL("/api/v1/geocode", {
      text: userInput,
      type: "STOP",
      mode: TRANSIT_MODES,
    });

    const response = await fetch(url);
    if (!response.ok)
      throw new MotisError([response.status, response.statusText].join());

    const result = await response.json();
    return result.map((s) => new StopPlace(s.id, s.name));
  }
}
