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
 * @param {string} stopId
 * @returns {string}
 */
function fixMotisStopId(stopId) {
  return stopId.split(":").slice(0, 3).join(":"); // todo remove _G?
}

/**
 * @param {Object} motisStop
 * @param {GeoDatabase} geoDatabase
 * @returns {Stop}
 */
function parseMotisStop(motisStop, geoDatabase) {
  const stop = geoDatabase.stopForMotisStopId(fixMotisStopId(motisStop.stopId));

  if (!stop)
    throw Error(`Unknown motis stop ${motisStop.name} ${motisStop.stopId}`);

  const city = geoDatabase.cityForStopId(stop.id);

  let arrival = null;
  if (motisStop.scheduledArrival)
    arrival = DateTime.fromISO(motisStop.scheduledArrival);

  let departure = null;
  if (motisStop.scheduledDeparture)
    departure = DateTime.fromISO(motisStop.scheduledDeparture);

  return new Stop(stop.id, stop.name, city, arrival, departure);
}

/**
 * @param {Object} motisLeg
 * @param {GeoDatabase} geoDatabase
 * @returns {Connection}
 */
function parseMotisConnection(motisLeg, geoDatabase) {
  const from = parseMotisStop(motisLeg.from, geoDatabase);
  const to = parseMotisStop(motisLeg.to, geoDatabase);

  const intermediate = []; // todo parse intermediate stops

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
 * @param {GeoDatabase} geoDatabase
 * @returns {Itinerary}
 */
function parseMotisItinerary(motisItinerary, geoDatabase) {
  // remove walk legs
  const legs = motisItinerary.legs.filter((l) => l.mode !== "WALK");

  return new Itinerary(
    legs.map((leg) => parseMotisConnection(leg, geoDatabase)),
  );
}

export class MotisClient {
  constructURL(path, params) {
    const url = new URL(path, BASE_URL);
    url.search = new URLSearchParams(params).toString();
    return url;
  }

  /**
   * @param {String} fromCityId
   * @param {String} toCityId
   * @param {DateTime} startDate
   * @param {GeoDatabase} geoDatabase
   * @returns {Promise<Itinerary[]>}
   */
  async plan(fromCityId, toCityId, startDate, geoDatabase) {
    const fromStopId = geoDatabase.motisStopIdForCityId(fromCityId);
    const toStopId = geoDatabase.motisStopIdForCityId(toCityId);

    const url = this.constructURL("/api/v3/plan", {
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
    return data.itineraries.map((itinerary) =>
      parseMotisItinerary(itinerary, geoDatabase),
    );
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
