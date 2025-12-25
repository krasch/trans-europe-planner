import { Stop } from "script/types/stop.js";

// todo check times work and stops work

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

    // todo unique id that includes date
    this.id = tripId + "XXX" + this.from.stopId + "XXX" + this.to.stopId;

    this.stops = [this.from].concat(this.intermediateStops).concat(this.to);
  }

  get isMultiday() {
    const start = this.from.departure.startOf("day");
    const end = this.to.arrival.startOf("day");

    return start.toMillis() !== end.toMillis();
  }
}
