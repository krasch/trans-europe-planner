/**
 * @typedef City
 * @type {object}
 * @property {string} id
 * @property {string} name
 */

/**
 * todo use luxon types package
 * @typedef DateTime
 * @type {object}
 * @property {any} startOf
 * @property {any} diff
 * @property {any} toISO
 * @property {any} toFormat
 */

export class Stop {
  /**
   * @param {string} stopId
   * @param {string} stopName
   * @param {City} city
   * @param {DateTime} arrival
   * @param {DateTime} departure
   */
  constructor(stopId, stopName, city, arrival, departure) {
    this.stopId = stopId;
    this.stopName = stopName;
    this.city = city; // {id: , name: }
    this.arrival = arrival;
    this.departure = departure;
  }
}
