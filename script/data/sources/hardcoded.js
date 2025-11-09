import assert from "assert";

import { GeoDatabase } from "script/data/geoDatabase.js";
import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";
import { DefaultMap } from "script/util.js";

const PLACEHOLDER_DATE = DateTime.fromISO("2025-01-01");
const NUM_DAYS = 3;

/**
 * @typedef {import("data/inputDataFormats.js").StopTime} InputStopFormat
 * @typedef {import("data/inputDataFormats.js").Connection} InputConnectionFormat
 */

/**
 * @param {DateTime} date
 * @param {string} timeString e,g. 07:02:03 or 36:04:19
 * @returns {DateTime}
 */
export function initDatetime(date, timeString) {
  const [hours, minutes, seconds] = timeString.split(":");

  return date.plus({ hours: hours, minutes: minutes });
}

/**
 * @param {InputStopFormat} data
 * @param {DateTime} travelDate
 * @param {GeoDatabase} geoDatabase
 * @returns Stop
 */
export function initStop(data, travelDate, geoDatabase) {
  let arrival = null;
  if (data.arrivalTime) arrival = initDatetime(travelDate, data.arrivalTime);

  let departure = null;
  if (data.departureTime)
    departure = initDatetime(travelDate, data.departureTime);

  return new Stop(
    data.stopId,
    geoDatabase.stopName(data.stopId),
    geoDatabase.cityForStopId(data.stopId),
    arrival,
    departure,
  );
}

/**
 * @param {InputConnectionFormat} data
 * @param {DateTime} travelDate
 * @param {GeoDatabase} geoDatabase
 * @returns {Connection}
 */
export function initConnection(data, travelDate, geoDatabase) {
  const stops = data.stops.map((s) => initStop(s, travelDate, geoDatabase));

  const from = stops[0];
  const to = stops.at(-1);
  const intermediate = stops.slice(1, stops.length - 1);

  return new Connection(data.id, data.type, data.name, from, to, intermediate);
}

/**
 * @param {Connection} connection
 * @param {Number} fromIdx inclusive
 * @param {Number} toIdx exclusive
 * @returns Connection sliced from [fromIdx,toIdx)
 */
export function sliceConnection(connection, fromIdx, toIdx) {
  assert(fromIdx < toIdx);

  const slicedStops = connection.stops.slice(fromIdx, toIdx);

  const from = slicedStops[0];
  const to = slicedStops.at(-1);
  const intermediate = slicedStops.slice(1, -1);

  // these attributes are not set for first/last stop in connection
  from.arrival = null;
  to.departure = null;

  return new Connection(
    connection.tripId,
    connection.mode,
    connection.name,
    from,
    to,
    intermediate,
  );
}

export class HardcodedConnectionDatabase {
  #connections;
  #connectionIdToStopId;
  #connectionStopOrder;

  /**
   * @param {InputConnectionFormat[]} connections
   * @param {any} routes
   * @param {GeoDatabase} geoDatabase
   */
  constructor(connections, routes, geoDatabase) {
    /** @type {Map<string, Connection>} */
    this.#connections = new Map();

    /** @type {DefaultMap<string, string[]>} */
    this.#connectionIdToStopId = new DefaultMap(() => []);

    /** @type {Map<string,Object<string,number>>} */
    this.#connectionStopOrder = new DefaultMap(() => {});

    // convert to Connection type, using placeholder date
    connections.forEach((c) => {
      const connection = initConnection(c, PLACEHOLDER_DATE, geoDatabase);
      this.#connections.set(connection.id, connection);

      // for quick lookup of all connections stopping at stop A
      connection.stops.forEach((stop) => {
        this.#connectionIdToStopId.get(stop.stopId).push(connection.id);
      });

      // for quick lookup if one stops comes before the other in a connection
      connection.stops.forEach((stop, stopIdx) => {
        this.#connectionStopOrder.get(connection.id)[stop.stopId] = stopIdx;
      });
    });
  }

  /**
   * @param {String} fromCityId
   * @param {String} toCityId
   * @param {DateTime} startDate
   * @param {GeoDatabase} geoDatabase
   * @returns {Promise<Itinerary[]>}
   */
  async plan(fromCityId, toCityId, startDate, geoDatabase) {
    return new Promise(null);
  }

  /**
   * @param {String} fromCityId
   * @param {String} toCityId
   * @param {DateTime} startDate
   * @param {GeoDatabase} geoDatabase
   * @returns {Promise<Connection[]>}
   */
  async direct(fromCityId, toCityId, startDate, geoDatabase) {
    const fromStopIds = geoDatabase.stopIdsForCityId(fromCityId);
    const toStopIds = geoDatabase.stopIdsForCityId(toCityId);

    // todo other stop ids
    const matches = this.#directConnectionIds(
      fromStopIds.mainStopId,
      toStopIds.mainStopId,
    );

    return new Promise((resolve, reject) => {
      resolve(null);
    });
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   */
  #directConnectionIds(fromStopId, toStopId) {
    const candidatesFrom = this.#connectionIdToStopId.get(fromStopId);
    const candidatesTo = this.#connectionIdToStopId.get(toStopId);

    // connections that stop in both from and to stop
    const candidates = candidatesFrom.filter((c) => candidatesTo.includes(c));

    // keep only the part of the connection between from and to
    const sliced = candidates.filter((c) => {
      const stopIndices = this.#connectionStopOrder.get(c.id);

      // this connection goes in the wrong direction
      if (stopIndices[fromStopId] > stopIndices[toStopId]) return null;
    });

    // in right direction
    //return candidates.filter((c) =>
    //  this.#hasRightDirection(c, fromStopId, toStopId),
    //);
  }
}

/*    // maps {stopId: idx} - needed for hardcoded connection dataset
    this.stopIndices = Object.fromEntries(
      this.stops.map((s, i) => [s.stopId, i]),
    );*/
