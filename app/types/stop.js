import { DateTime } from "./dateTime.js";

export class Stop {
  /**
   * @param {string} id
   * @param {string} name
   * @param {number} latitude
   * @param {number} longitude
   */
  constructor(id, name, latitude, longitude) {
    this.id = id;
    this.name = name;
    this.latitude = latitude;
    this.longitude = longitude;
  }

  get lnglat() {
    return [this.longitude, this.latitude];
  }
}

export class StopTime {
  /**
   * @param {Stop} stop
   * @param {DateTime} arrival
   * @param {DateTime} departure
   */
  constructor(stop, arrival, departure) {
    this.stop = stop;
    this.arrival = arrival;
    this.departure = departure;
  }
}
