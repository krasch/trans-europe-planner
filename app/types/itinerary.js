import { Connection, ConnectionId } from "./connection.js";
import { StopTime } from "./stop.js";

/**
 * @param {ConnectionId[]} connectionIds
 */
export function geoRoute(connectionIds) {
  const stopIds = [connectionIds[0].fromStopId].concat(
    connectionIds.map((c) => c.toStopId),
  );
  return stopIds.join("->");
}

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
        new StopTime(
          connections[i].from.stop,
          connections[i - 1].to.arrival,
          connections[i].from.departure,
        ),
      );
    }

    this.geoRoute = geoRoute(this.connectionIds);
  }
}
