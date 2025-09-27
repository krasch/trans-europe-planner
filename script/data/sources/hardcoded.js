import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";

import { GeoDatabase } from "../geoDatabase.js";

export class HardcodedConnectionDatabase {
  constructor(connections, routes) {}

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
    return new Promise(null);
  }
}
