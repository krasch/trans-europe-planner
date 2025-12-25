import { MotisClient } from "script/data/sources/motis.js";
import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { groupBy } from "script/util.js";

export class TravelDatabase {
  #client;

  #cache = { plan: new Map(), direct: new Map() };

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
    const key = this.#hashKey(fromStopId, toStopId, fromDate);

    if (this.#cache.plan.has(key)) return this.#cache.plan.get(key);

    // must await, because want to transform the itineraries
    const itineraries = await this.#client.plan(fromStopId, toStopId, fromDate);

    // group by geographical route
    // todo keep only the best geographical routes
    const grouped = groupBy(itineraries, (i) => i.stopIds.join("->"));

    // todo calculate itinerary score and keep only the best for each geographical route
    // todo right now always keeping the first itinerary for each route
    const result = Object.keys(grouped).map((key) => grouped[key][0]);

    this.#cache.plan.set(key, result);
    return result;
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} fromDate
   * @returns {Promise<Connection[]>}
   */
  direct(fromStopId, toStopId, fromDate) {
    const key = this.#hashKey(fromStopId, toStopId, fromDate);

    if (this.#cache.direct.has(key)) return this.#cache.direct.get(key);

    const promise = this.#client.direct(fromStopId, toStopId, fromDate);

    promise.then((connections) => {
      this.#cache.direct.set(key, connections);
    });

    return promise;
  }

  /**
   * @param {Itinerary} itinerary
   * @param {DateTime} fromDate
   * @returns {Object.<String,Connection[] | null>}
   */
  getAlternatives(itinerary, fromDate) {
    const alternatives = {};
    for (let ref of itinerary.connections) {
      const key = this.#hashKey(ref.from.stopId, ref.to.stopId, fromDate);

      // todo this is really un-intuitive
      if (this.#cache.direct.has(key)) {
        alternatives[ref.id] = this.#cache.direct
          .get(key)
          .filter((c) => c.id !== ref.id);
      } else alternatives[ref.id] = null;
    }
    return alternatives;
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} fromDate
   */
  #hashKey(fromStopId, toStopId, fromDate) {
    return `${fromStopId}->${toStopId}@${fromDate.toFormat("yyyy-MM-dd")}`;
  }
}
