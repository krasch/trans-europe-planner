import * as motis from "app/data/motis/client.js";
import { Connection, ConnectionId } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";
import { groupBy } from "app/utils/collections.js";

import { PlannerCache } from "./cache.js";
import { isParetoOptimal, itineraryScore } from "./scoring.js";

export class PlannerError extends Error {
  constructor(message) {
    super(message);
    this.name = "PlannerError";
  }
}

/**
 * @template T
 * @param {T} data
 * @return {Promise<T>}
 */
function asPromise(data) {
  return new Promise((resolve, reject) => resolve(data));
}

export class Planner {
  #cache;

  constructor() {
    this.#cache = new PlannerCache();
  }

  /**
   * @param {ConnectionId} id
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Connection>}
   */
  async connectionForId(id, calendarStartDate) {
    const cached = this.#cache.getConnectionById(id);
    if (cached) return asPromise(cached);

    // this method fills our trips/connections cache -> don't need to fill cache here
    // uses "calendarStartDate" not id.calendarStartDate to get data for multiple days!
    const connections = await this.#getAllDirect(
      id.fromStopId,
      id.toStopId,
      calendarStartDate,
    );

    // find the right trip from all the direct options
    const matches = connections.filter((c) => c.id.equals(id));

    if (matches.length === 0)
      throw new PlannerError(`Unknown connection with id ${id}`);

    return matches[0]; // todo what if multiple matches?
  }

  /**
   * @param {ConnectionId[]} connectionIds
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Itinerary>}
   */
  async itineraryForIds(connectionIds, calendarStartDate) {
    // todo handle errors
    const promises = connectionIds.map((id) =>
      this.connectionForId(id, calendarStartDate),
    );
    return Promise.all(promises).then(
      (connections) => new Itinerary(connections),
    );
  }

  /**
   * @param {String} fromStopId
   * @param {String} toStopId
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Itinerary[]>} one itinerary per geoRoute, best route first
   */
  async plan(fromStopId, toStopId, calendarStartDate) {
    const cached = this.#cache.getPlan(fromStopId, toStopId, calendarStartDate);
    if (cached) return asPromise(cached);

    // must await, because want to transform the itineraries
    // todo put into then?
    const itineraries = await motis.plan(
      fromStopId,
      toStopId,
      calendarStartDate,
    );

    // bunch of connections in here, put them all into cache
    itineraries.forEach((i) =>
      i.connections.forEach((c) => this.#cache.putConnection(c)),
    );

    // group by geographical route
    const grouped = Object.values(groupBy(itineraries, (i) => i.geoRoute));

    // order so that itineraries that work often come first
    // todo this should do a group score
    const sortLongest = (group1, group2) => group2.length - group1.length;
    const sorted = grouped.sort(sortLongest);

    // keep only pareto-optimal solutions (how often, how many transfers)
    // todo might just tag the non-pareto optimal ones?
    // todo what if user comes back via URL and some route is not longer pareto-optimal?
    const pareto = sorted.filter((g) => isParetoOptimal(g, sorted));

    // keep highest-scoring itinerary per route
    const sortHighest = (i1, i2) =>
      itineraryScore(i2, calendarStartDate) -
      itineraryScore(i1, calendarStartDate);
    const result = pareto.map((group) => group.sort(sortHighest)[0]);

    this.#cache.putPlan(fromStopId, toStopId, calendarStartDate, result);
    return result;
  }

  /**
   * @param {Connection} connection
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Connection[]>}
   */
  async alternativeConnections(connection, calendarStartDate) {
    return this.#getAllDirect(
      connection.from.stop.id,
      connection.to.stop.id,
      calendarStartDate,
    ).then((options) => options.filter((o) => !o.id.equals(connection.id)));
  }

  /**
   * @param {Itinerary} itinerary
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Connection[][]>}
   */
  async allAlternativeConnections(itinerary, calendarStartDate) {
    const promises = itinerary.connections.map((c) =>
      this.alternativeConnections(c, calendarStartDate),
    );
    return Promise.all(promises);
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} calendarStartDate
   * @returns {Promise<Connection[]>}
   */
  async #getAllDirect(fromStopId, toStopId, calendarStartDate) {
    const cached = this.#cache.getAllDirect(
      fromStopId,
      toStopId,
      calendarStartDate,
    );
    if (cached) return asPromise(cached);

    const resultPromise = motis.direct(fromStopId, toStopId, calendarStartDate);

    // fill cache, both for the full direct query and the individual connections
    resultPromise.then((connections) => {
      this.#cache.putAllDirect(
        fromStopId,
        toStopId,
        calendarStartDate,
        connections,
      );
      connections.forEach((c) => this.#cache.putConnection(c));
    });

    return resultPromise;
  }
}
