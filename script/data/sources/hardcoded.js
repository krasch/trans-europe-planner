import assert from "assert";

import { GeoDatabase } from "script/data/geoDatabase.js";
import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

/**
 * @typedef {import("data/inputDataFormats.js").Connection} InputConnectionFormat
 */

export class InputConnectionDataWrapper {
  /**
   * @param {InputConnectionFormat} data
   */
  constructor(data) {
    this.data = data;

    this.stopOrder = new Map();
    data.stops.forEach((s, i) => this.stopOrder.set(s.stopId, i));
  }

  /**
   * todo do for cities
   * @param {string} fromStopId
   * @param {string} toStopId
   * @returns InputConnectionDataWrapper
   */
  slice(fromStopId, toStopId) {
    assert(this.connects(fromStopId, toStopId));

    const slicedStops = this.data.stops.slice(
      this.stopOrder.get(fromStopId),
      this.stopOrder.get(toStopId) + 1,
    );

    // the new starting stop could have a departure > 24 -> need to shift all times
    const newDeparture = slicedStops[0].departureTime;
    const dayOffset = Math.floor(
      this.#splitTimeString(newDeparture).hours / 24,
    );

    const shiftedStops = slicedStops.map((s) => ({
      stopId: s.stopId,
      departureTime: this.#shiftTimestring(s.departureTime, dayOffset),
      arrivalTime: this.#shiftTimestring(s.arrivalTime, dayOffset),
    }));

    shiftedStops[0].arrivalTime = null;
    shiftedStops.at(-1).departureTime = null;

    return new InputConnectionDataWrapper({
      id: this.data.id,
      type: this.data.type,
      name: this.data.name,
      stops: shiftedStops,
    });
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @returns {boolean}
   */
  connects(fromStopId, toStopId) {
    return (
      this.stopOrder.has(fromStopId) &&
      this.stopOrder.has(toStopId) &&
      this.stopOrder.get(fromStopId) < this.stopOrder.get(toStopId)
    );
  }

  /**
   * Convert to our proper Connection format. Sets a travel date!
   * @param {DateTime} travelDate
   * @param {GeoDatabase} geoDatabase
   * @returns {Connection}
   */
  convert(travelDate, geoDatabase) {
    const stops = this.data.stops.map(
      (s) =>
        new Stop(
          s.stopId,
          geoDatabase.stopName(s.stopId),
          geoDatabase.cityForStopId(s.stopId),
          this.#initDatetime(travelDate, s.arrivalTime),
          this.#initDatetime(travelDate, s.departureTime),
        ),
    );

    const from = stops[0];
    const to = stops.at(-1);
    const intermediate = stops.slice(1, stops.length - 1);

    from.arrival = null;
    to.departure = null;

    return new Connection(
      this.data.id,
      this.data.type,
      this.data.name,
      from,
      to,
      intermediate,
    );
  }

  /**
   * @param {string} timeString
   */
  #splitTimeString(timeString) {
    const [hours, minutes, seconds] = timeString.split(":");
    return { hours: Number(hours), minutes: Number(minutes) };
  }

  /**
   * @param {DateTime} date
   * @param {string} timeString e,g. 07:02:03 or 36:04:19
   * @returns {DateTime}
   */
  #initDatetime(date, timeString) {
    if (timeString === null) return null;
    const split = this.#splitTimeString(timeString);
    return date.plus({ hours: split.hours, minutes: split.minutes });
  }

  /**
   * @param {string} timeString
   * @param {number} numDays
   * @returns {string} shiftedTimeString
   */
  #shiftTimestring(timeString, numDays) {
    if (timeString === null) return null;
    const split = this.#splitTimeString(timeString);

    const hours = split.hours - numDays * 24;
    const minutes = split.minutes;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }
}

export class HardcodedConnectionDatabase {
  #connections;

  /**
   * @param {InputConnectionFormat[]} connections
   * @param {any} routes
   * @param {GeoDatabase} geoDatabase
   */
  constructor(connections, routes, geoDatabase) {
    this.#connections = connections.map(
      (c) => new InputConnectionDataWrapper(c),
    );
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

    // todo better lookup so I don't have to look at all connections
    // todo other stop ids
    const result = this.#connections
      // which connections run between these stops?
      .filter((c) => c.connects(fromStopIds.mainStopId, toStopIds.mainStopId))
      // slice connection up to keep only the piece we need
      .map((c) => c.slice(fromStopIds.mainStopId, toStopIds.mainStopId))
      // apply date and convert to our internal format;
      .map((c) => c.convert(startDate, geoDatabase));

    return new Promise((resolve, reject) => {
      resolve(result);
    });
  }
}
