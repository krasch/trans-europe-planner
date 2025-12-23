import { GeoDatabase } from "script/data/geoDatabase.js";
import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

const BASE_URL = "http://localhost:8080";
const TRANSIT_MODES = "REGIONAL_RAIL";
const SEARCH_WINDOW = 3 * 24 * 60 * 60; // 3 days in seconds

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
    motisStop.lng,
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
      detailedTransfers: false, // don't return geodata
      transitModes: TRANSIT_MODES,
      time: startDate.toISO(),
      searchWindow: SEARCH_WINDOW, // 3 days in seconds
    });

    const response = await fetch(url);
    if (!response.ok)
      throw new MotisError([response.status, response.statusText].join());

    const data = await response.json();
    return data.itineraries.map(parseMotisItinerary);
  }

  /**
   * @param {String} fromCityId
   * @param {String} toCityId
   * @param {DateTime} startDate
   * @param {GeoDatabase} geoDatabase
   * @returns {Promise<Connection[]>}
   */
  async direct(fromCityId, toCityId, startDate, geoDatabase) {
    const itineraries = await this.plan(
      fromCityId,
      toCityId,
      startDate,
      geoDatabase,
    );

    return itineraries
      .filter((i) => i.vias.length === 0) // only want direct
      .map((i) => i.connections[0]); // only want the first (=only) connection
  }
}
