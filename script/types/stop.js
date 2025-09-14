import { DateTime } from "./dateTime.js";

export class Stop {
  /**
   * @param {string} stopId
   * @param {string} stopName
   * @param {{id: string, name: string}} city
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
