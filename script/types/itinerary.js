import { Stop } from "./stop.js";

export class Itinerary {
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
          connections[i].from.city,
          connections[i - 1].to.arrival,
          connections[i].from.departure,
        ),
      );
    }

    this.cities = [this.from.city]
      .concat(this.vias.map((v) => v.city))
      .concat(this.to.city);

    //this.geoRoute = cityNames.join("->"); // todo directly go with id? todo should use this instead of id for clarity?
    this.id = this.cities.map((city) => city.id).join("->"); // todo this is the internal id, not used by component data todo delete?
  }
}
