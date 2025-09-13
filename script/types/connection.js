import { Stop } from "script/types/stop.js";

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
    this.mode = mode;
    this.name = name;
    this.from = from;
    this.to = to;
    this.intermediateStops = intermediateStops;

    this.id = tripId + "XXX" + this.from.stopId + "XXX" + this.to.stopId;

    this.stops = [this.from].concat(this.intermediateStops).concat(this.to);
    this.edges = [];
    for (let i = 1; i < this.stops.length; i++)
      this.edges.push({ from: this.stops[i - 1], to: this.stops[i] });
  }

  get isMultiday() {
    const start = this.from.departure.startOf("day");
    const end = this.to.arrival.startOf("day");

    return start.toMillis() !== end.toMillis();
  }
}
