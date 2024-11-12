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

    const baseId = `${template.id}XXX${date}`;
    result.push(new Connection(baseId, template.name, template.type, stops));
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
    const [trainId, date, leg] = id.split("XXX");

    if (!trainId || !date || !leg)
      throw new DatabaseError(`Invalid connection id ${id}`);

    if (!this.#slicedConnectionIdsByLeg[leg]) this.#indexLeg(leg);

    if (!this.#slicedConnectionsById[id])
      throw new DatabaseError(`Unknown connection ${id}`);
    return this.#slicedConnectionsById[id];
  }

  connectionsForLeg(leg) {
    if (!this.#slicedConnectionIdsByLeg[leg]) this.#indexLeg(leg);

    const connectionIds = this.#slicedConnectionIdsByLeg[leg];
    if (connectionIds.length === 0)
      throw new DatabaseError(`No connections available for leg ${leg}`);

    // todo return list instead of dict?
    return connectionIds.map((c) => this.connection(c));
  }

  #indexLeg(leg) {
    const [startCityName, endCityName] = leg.split("->");
    if (!startCityName || !endCityName)
      throw new DatabaseError(`Invalid leg name ${leg}`);

    this.#slicedConnectionIdsByLeg[leg] = [];

    for (let connection of this.#fullConnections) {
      const sliced = connection.slice(startCityName, endCityName);

      // there is no such slice -> can not fulfill this leg with this connection
      if (sliced === null) continue;

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
