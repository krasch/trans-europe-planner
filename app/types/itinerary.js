import { Connection } from "./connection.js";
import { Stop } from "./stop.js";

export class Itinerary {
  /**
   * @param {Connection[]} connections
   */
  constructor(connections) {
    this.connections = connections;
    this.connectionIds = this.connections.map((c) => c.id);

    this.from = this.connections[0].from;
    this.to = this.connections.at(-1).to;

    this.vias = [];
    for (let i = 1; i < connections.length; i++) {
      this.vias.push(
        new Stop(
          connections[i].from.stopId,
          connections[i].from.stopName,
          connections[i].from.latitude,
          connections[i].from.longitude,
          connections[i - 1].to.arrival,
          connections[i].from.departure,
        ),
      );
    }

    const stopIds = [this.from.stopId]
      .concat(this.vias.map((v) => v.stopId))
      .concat(this.to.stopId);

    // todo delete in favor of georoute todo why are tests not failing when I delete this?
    this.id = stopIds.join("->");
    this.geoRoute = stopIds.join("->");
  }
}
