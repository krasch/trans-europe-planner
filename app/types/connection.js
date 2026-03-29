import { DateTime } from "./dateTime.js";
import { Stop } from "./stop.js";

export class ConnectionId {
  /**
   * @param {String} tripId
   * @param {String} fromStopId
   * @param {String} toStopId
   * @param {DateTime} date
   */
  constructor(tripId, fromStopId, toStopId, date) {
    this.tripId = tripId;
    this.fromStopId = fromStopId;
    this.toStopId = toStopId;
    this.date = date; // todo not needed because already in motis?
  }

  /**
   * @returns {String}
   */
  toString() {
    return (
      this.tripId +
      "XXX" +
      this.fromStopId +
      "XXX" +
      this.toStopId +
      "XXX" +
      this.date.toISODate()
    );
  }

  /**
   * @param {string} connectionIdString
   */
  static fromString(connectionIdString) {
    const split = connectionIdString.split("XXX");
    return new ConnectionId(
      split[0],
      split[1],
      split[2],
      DateTime.fromISO(split[3]),
    );
  }
}

export class Connection {
  /**
   * @param {string} tripId
   * @param {string} mode
   * @param {string} name
   * @param {Stop} from
   * @param {Stop} to
   * @param {Stop[]} intermediateStops
   */
  constructor(tripId, mode, name, from, to, intermediateStops) {
    this.tripId = tripId;
    this.mode = mode;
    this.name = name;

    this.from = from;
    this.to = to;
    this.intermediateStops = intermediateStops;
    this.stops = [this.from].concat(this.intermediateStops).concat(this.to);

    this.id = new ConnectionId(
      tripId,
      this.from.stopId,
      this.to.stopId,
      this.from.departure.startOf("day"),
    );
  }

  get isMultiday() {
    const start = this.from.departure.startOf("day");
    const end = this.to.arrival.startOf("day");

    return start.toMillis() !== end.toMillis();
  }
}
