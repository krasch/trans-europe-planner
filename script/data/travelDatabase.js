import { MotisClient } from "script/data/sources/motis.js";
import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { groupBy } from "script/util.js";

export class TravelDatabase {
  #client;

  #connectionCache = {};

  /**
   * @param {MotisClient} client
   */
  constructor(client) {
    this.#client = client;
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} fromDate
   * @returns {Promise<Itinerary[]>}
   *   // todo toDate
   */
  async plan(fromStopId, toStopId, fromDate) {
    const itineraries = await this.#client.plan(fromStopId, toStopId, fromDate);

    for (let itinerary of itineraries)
      for (let connection of itinerary.connections)
        this.#connectionCache[connection.id] = connection; // todo browser cache?

    // group by geographical route
    // todo keep only the best geographical routes
    const grouped = groupBy(itineraries, (i) => i.stopIds.join("->"));

    // todo calculate itinerary score and keep only the best for each geographical route
    // todo right now always keeping the first itinerary for each route
    const result = Object.keys(grouped).map((key) => grouped[key][0]);

    return result;
  }

  /**
   * @param {Itinerary} itinerary
   * @param {DateTime} fromDate
   * @returns {Promise<Connection[][]>}
   */
  async getAlternatives(itinerary, fromDate) {
    if (!itinerary) return null;

    const alternatives = []; // will be one entry for each connection in the itinerary
    for (let reference of itinerary.connections) {
      // all direct connections between these two cities in this time range
      const options = await this.#client.direct(
        reference.from.city.id,
        reference.to.city.id,
        fromDate,
        this.geoDatabase,
      );

      for (let connection of options)
        this.#connectionCache[connection.id] = connection;

      // remove the reference connection
      alternatives.push(options.filter((o) => o.id !== reference.id));
    }
    return alternatives;
  }

  /**
   * @param {string} id
   * @returns {Connection}
   */
  getCachedConnection(id) {
    return this.#connectionCache[id];
  }
}
