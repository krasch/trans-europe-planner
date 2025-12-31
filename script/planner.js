import { Connection } from "script/types/connection.js";
import {
  DateTime,
  diffDays,
  minutesSinceMidnight,
} from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { groupBy } from "script/util.js";

import { plan as motis_plan, direct as motis_direct } from "./motis/client.js";
import { GeocodedLocation } from "./motis/parser.js";

/**
 * @param {Itinerary} itinerary
 * @param {DateTime} fromDate
 * @returns {Number}
 */
function itineraryScore(itinerary, fromDate) {
  const days = diffDays(fromDate, itinerary.to.arrival);

  const departureMinutes = itinerary.connections.map((c) =>
    minutesSinceMidnight(c.from.departure),
  );
  const arrivalMinutes = itinerary.connections.map((c) =>
    minutesSinceMidnight(c.to.arrival),
  );

  const earliestDeparture = Math.min(...departureMinutes);
  const latestArrival = Math.max(...arrivalMinutes);

  const minutesBefore8 = Math.max(0, 8 * 60 - earliestDeparture);
  const minutesAfter22 = Math.max(0, latestArrival - 22 * 60);

  return -1000 * days - minutesBefore8 - minutesAfter22;
}

/**
 * @param {Itinerary[]} group
 * @param {Itinerary[][]} otherGroups
 */
function isParetoOptimal(group, otherGroups) {
  for (let other of otherGroups) {
    const otherRunsMoreOften = other.length > group.length;
    const otherHasFewerTransfers = other[0].vias.length < group[0].vias.length;
    if (otherRunsMoreOften && otherHasFewerTransfers) return false;
  }
  return true;
}

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
   * @param {GeocodedLocation} from
   * @param {GeocodedLocation} to
   * @param {DateTime} fromDate
   * @returns {Promise<Itinerary[]>}
   *   // todo toDate
   */
  async plan(from, to, fromDate) {
    //const key = this.#hashKey(from, to, fromDate); // ouch

    //if (this.#cache.plan.has(key)) return this.#cache.plan.get(key);

    // must await, because want to transform the itineraries
    const itineraries = await motis_plan(from, to, fromDate);

    // group by geographical route
    const geoRoute = (i) => i.vias.map((v) => v.stopName).join("->");
    const grouped = Object.values(groupBy(itineraries, geoRoute));

    // order so that itineraries that work often come first
    const sortLongest = (group1, group2) => group2.length - group1.length;
    const sorted = grouped.sort(sortLongest);

    /*for (let group of sorted) {
      console.log(
        group[0].vias.map((v) => [v.stopId, v.stopName]),
        group[0].connections.map((c) => c.mode),
        group.length,
        isParetoOptimal(group, sorted),
      );
    }*/

    // keep only pareto-optimal solutions (how often, how many transfers)
    const pareto = sorted.filter((g) => isParetoOptimal(g, grouped));

    // keep highest-scoring itinerary per route
    const sortHighest = (i1, i2) =>
      itineraryScore(i2, fromDate) - itineraryScore(i1, fromDate);
    const result = pareto.map((group) => group.sort(sortHighest)[0]);

    // todo add to connection cache? not so important,
    //  everything will show up in direct call anyway
    //this.#cache.plan.set(key, result);

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
