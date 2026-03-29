import { Connection, ConnectionId } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Stop } from "app/types/stop.js";

export class PlannerCache {
  #TTL;
  #cache;

  /**
   * @param {Number} TTL in minutes
   */
  constructor(TTL = 60) {
    this.#TTL = TTL;
    this.#cache = new Map();
  }

  #get(key) {
    return this.#cache.get(key); // todo TTL
  }

  #set(key, value) {
    this.#cache.set(key, value); // todo TTL
  }

  /**
   * @param {Connection} c
   */
  putConnection(c) {
    const key = `connection_${c.id.toString()}`;
    this.#set(key, c);
  }

  /**
   * @param {ConnectionId} id
   * @returns Connection | undefined
   */
  getConnectionById(id) {
    const key = `connection_${id.toString()}`;
    return this.#get(key);
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} date
   * @param {Connection[]} result
   */
  putAllDirect(fromStopId, toStopId, date, result) {
    const key = `allDirect_${fromStopId}_${toStopId}_${date.toISODate()}`;
    this.#set(key, result);
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} date
   * @returns Connection[] | undefined
   */
  getAllDirect(fromStopId, toStopId, date) {
    const key = `allDirect_${fromStopId}_${toStopId}_${date.toISODate()}`;
    return this.#get(key);
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} date
   * @param {Connection[]} result
   */
  putPlan(fromStopId, toStopId, date, result) {
    const key = `plan__${fromStopId}_${toStopId}_${date.toISODate()}`;
    this.#set(key, result);
  }

  /**
   * @param {string} fromStopId
   * @param {string} toStopId
   * @param {DateTime} date
   * @returns Connection[] | undefined
   */
  getPlan(fromStopId, toStopId, date) {
    const key = `plan__${fromStopId}_${toStopId}_${date.toISODate()}`;
    return this.#get(key);
  }

  /**
   * @param {Stop} stop
   */
  putStop(stop) {
    const key = `stop__${stop.stopId}`;
    this.#set(key, stop);
  }

  /**
   * @param {String} stopId
   * @returns Stop | null
   */
  getStopInfo(stopId) {
    const key = `stop__${stopId}`;
    return this.#get(key);
  }
}
