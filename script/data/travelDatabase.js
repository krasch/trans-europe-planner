import { groupBy } from "../util.js";

export class TravelDatabase {
  #client;
  geoDatabase;

  #planCache = {};
  #directCache = {};
  #connectionCache = {};

  constructor(client, geoDatabase) {
    this.#client = client;
    this.geoDatabase = geoDatabase;
  }

  // todo toDate
  async plan(fromCityId, toCityId, fromDate) {
    const itineraries = await this.#client.plan(
      fromCityId,
      toCityId,
      fromDate,
      this.geoDatabase,
    );

    for (let itinerary of itineraries)
      for (let connection of itinerary.connections)
        this.#connectionCache[connection.id] = connection;

    // group by geographical route
    // todo keep only the best geographical routes
    const grouped = groupBy(itineraries, (itinerary) =>
      itinerary.cities.map((c) => c.id).join("->"),
    );

    // todo calculate itinerary score and keep only the best for each geographical route
    // todo right now always keeping the first itinerary for each route
    const result = Object.keys(grouped).map((key) => grouped[key][0]);

    return result;
  }

  async getAlternatives(itinerary, fromDate) {
    if (!itinerary) return null;

    const alternatives = []; // will be one entry for each connection in the itinerary
    for (let reference of itinerary.connections) {
      // all direct connections between these two cities in this time range
      const options = await this.#client.direct(
        reference.from.city.id,
        reference.to.city.id,
        fromDate,
        this.geoDatabase,
      );

      for (let connection of options)
        this.#connectionCache[connection.id] = connection;

      // remove the reference connection
      alternatives.push(options.filter((o) => o.id !== reference.id));
    }
    return alternatives;
  }

  getCachedConnection(id) {
    return this.#connectionCache[id];
  }
}
