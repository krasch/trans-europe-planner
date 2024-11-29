class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadDatabaseQuery";
  }
}

function enrichAndTemporalizeConnection(template, stations, cities, dates) {
  const result = [];

  for (let date of dates) {
    const stops = [];
    for (let stop of template.stops) {
      stops.push({
        // temporalize
        arrival: new CustomDateTime(date, stop.arrival),
        departure: new CustomDateTime(date, stop.departure),
        // enrich with additional station and city info
        stationId: stop.station,
        stationName: stations[stop.station].name,
        stationIsPreferred: stations[stop.station].preferred,
        cityId: stations[stop.station].city,
        cityName: cities[stations[stop.station].city].name,
      });
    }

    result.push(
      new Connection(template.id, date, template.name, template.type, stops),
    );
  }

  return result;
}

class Database {
  #fullConnections;

  #slicedConnectionIdsByLeg;
  #slicedConnectionsById;

  constructor(connections) {
    this.#fullConnections = connections;

    // this will be filled with all the connections the UI is interested in
    // should always be accessed using connectionsForLeg to make sure that leg has been indexed
    this.#slicedConnectionIdsByLeg = {};
    this.#slicedConnectionsById = {};
  }

  connection(id) {
    if (typeof id === "string") id = ConnectionId.fromString(id);

    if (!this.#slicedConnectionIdsByLeg[id.leg]) this.#indexLeg(id.leg);

    if (!this.#slicedConnectionsById[id])
      throw new DatabaseError(`Unknown connection ${id}`);
    return this.#slicedConnectionsById[id];
  }

  connectionsForLeg(leg) {
    if (typeof leg === "string") leg = Leg.fromString(leg);

    if (!this.#slicedConnectionIdsByLeg[leg]) this.#indexLeg(leg);

    const connectionIds = this.#slicedConnectionIdsByLeg[leg];
    if (connectionIds.length === 0)
      throw new DatabaseError(`No connections available for leg ${leg}`);

    // todo return list instead of dict?
    return connectionIds.map((c) => this.connection(c));
  }

  localNetwork(city) {
    const result = new Map();

    for (let connection of this.#fullConnections) {
      if (!connection.hasStop(city)) continue;

      // from start of connection to desired city
      if (connection.start.cityName !== city) {
        const trace = connection.partialTrace(connection.start.cityName, city);
        const key = trace.map((l) => l.toString()).join(";");

        if (!result.has(key)) result.set(key, trace);
      }

      // from desired city to end of connection
      if (connection.end.cityName !== city) {
        const trace = connection.partialTrace(city, connection.end.cityName);
        const key = trace.map((l) => l.toString()).join(";");

        if (!result.has(key)) result.set(key, trace);
      }
    }

    return Array.from(result.values());
  }

  #indexLeg(leg) {
    this.#slicedConnectionIdsByLeg[leg] = [];

    for (let connection of this.#fullConnections) {
      let sliced;

      try {
        sliced = connection.slice(leg.startCityName, leg.endCityName);
      } catch (Error) {
        // can not use specific error because of issue with testing setup (imports)
        // there is no such slice -> can not fulfill this leg with this connection
        continue;
      }

      this.#slicedConnectionIdsByLeg[leg].push(sliced.id);
      this.#slicedConnectionsById[sliced.id] = sliced;
    }
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Database = Database;
  module.exports.DatabaseError = DatabaseError;
}
