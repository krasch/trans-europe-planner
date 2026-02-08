import { DateTime } from "./dateTime.js";

export class Stop {
  /**
   * @param {string} stopId
   * @param {string} stopName
   * @param {number} latitude
   * @param {number} longitude
   * @param {DateTime} arrival
   * @param {DateTime} departure
   */
  constructor(stopId, stopName, latitude, longitude, arrival, departure) {
    this.stopId = stopId;
    this.stopName = stopName;
    this.latitude = latitude;
    this.longitude = longitude;
    this.arrival = arrival;
    this.departure = departure;
  }

  get lnglat() {
    return [this.longitude, this.latitude];
  }
}
