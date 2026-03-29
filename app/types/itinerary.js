import { Connection } from "./connection.js";
import { Stop } from "./stop.js";

export class UnknownLegError extends Error {
  /**
   * @param {String} fromStopId
   * @param {String} toStopId
   */
  constructor(fromStopId, toStopId) {
    super(`Leg ${fromStopId} -> ${toStopId} is not part of current itinerary`);
    this.name = "UnknownLegError";
  }
}

export class Itinerary {
  /**
   * @param {Connection[]} connections
   */
  constructor(connections) {
    this.connections = connections;

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

  /**
   * @param {Connection} update
   * @returns {Itinerary}
   */
  replaceLeg(update) {
    const isMatch = (connection) =>
      update.from.stopId === connection.from.stopId &&
      update.to.stopId === connection.to.stopId;

    const matchIndices = this.connections
      .map((c, i) => i)
      .filter((i) => isMatch(this.connections[i]));

    if (matchIndices.length === 0)
      throw new UnknownLegError(update.from.stopId, update.to.stopId);

    const copy = Array.from(this.connections);
    copy[matchIndices[0]] = update;

    return new Itinerary(copy);
  }
}
