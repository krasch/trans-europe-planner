import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { groupBy } from "script/util.js";

import { plan as motis_plan, direct as motis_direct } from "./motis/client.js";

export class Planner {
  // todo map first two to ConnectionId instead to save some memory?
  #cache = {
    // maps from [from,to,date] to Itinerary[]
    plan: new Map(),
    // maps from [from,to,date] to Connection[]
    direct: new Map(),
    // maps from connectionId to Connection
    connections: new Map(),
  };

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
    const itineraries = await motis_plan(fromStopId, toStopId, fromDate);

    // group by geographical route
    // todo keep only the best geographical routes
    const grouped = groupBy(itineraries, (i) => i.stopIds.join("->"));

    // todo calculate itinerary score and keep only the best for each geographical route
    //  right now always keeping the first itinerary for each route
    const result = Object.keys(grouped).map((key) => grouped[key][0]);

    // todo add to connection cache? not so important,
    //  everything will show up in direct call anyway
    this.#cache.plan.set(key, result);
    return result;
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} fromDate
   * @returns {Promise<Connection[]>}
   */
  async direct(fromStopId, toStopId, fromDate) {
    const key = this.#hashKey(fromStopId, toStopId, fromDate);

    if (this.#cache.direct.has(key)) return this.#cache.direct.get(key);

    const promise = motis_direct(fromStopId, toStopId, fromDate);

    promise.then((connections) => {
      this.#cache.direct.set(key, connections);
      for (let c of connections) this.#cache.connections.set(c.id, c);
    });

    return promise;
  }

  /**
   * @param {Itinerary} itinerary
   * @param {DateTime} fromDate
   * @returns {Promise<Object.<String,Connection[] | null>>}
   */
  triggerLoadAlternatives(itinerary, fromDate) {
    const promises = [];
    for (let ref of itinerary.connections) {
      promises.push(this.direct(ref.from.stopId, ref.to.stopId, fromDate));
    }
    return Promise.all(promises);
  }

  /**
   * @param {String} id
   * @returns Connection
   */
  getCachedConnection(id) {
    return this.#cache.connections.get(id);
  }

  /**
   * @param {Itinerary} itinerary
   * @param {DateTime} fromDate
   * @returns {Object.<String,Connection[] | null>}
   */
  getCachedAlternatives(itinerary, fromDate) {
    const alternatives = {};
    for (let ref of itinerary.connections) {
      const key = this.#hashKey(ref.from.stopId, ref.to.stopId, fromDate);

      // there is no cache hit for this connection -> has not finished loading
      if (!this.#cache.direct.has(key)) {
        alternatives[ref.id] = null;
        continue;
      }

      // loading has finished; need to filter out the reference connection
      const cached = this.#cache.direct.get(key);
      alternatives[ref.id] = cached.filter((c) => c.id !== ref.id);
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
