class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadDatabaseQuery";
  }
}

function removeMultidayConnections(connections) {
  return connections.filter(
    (c) =>
      c.stops[0].departure.minutesSinceMidnight <=
      c.stops.at(-1).arrival.minutesSinceMidnight,
  );
}
function temporalizeConnections(connections) {
  const result = [];

  for (let connection of connections) {
    for (let date of ["2024-10-16", "2024-10-17", "2024-10-18"]) {
      const stops = connection.stops.map((s) => ({
        station: s.station,
        arrival: new CustomDateTime(date, s.arrival),
        departure: new CustomDateTime(date, s.departure),
      }));

      result.push({
        id: `${stops[0].departure.dateString}X${connection.id}`,
        type: connection.type,
        stops: stops,
      });
    }
  }

  return result;
}

function getPartialStops(stops, startCityId, endCityId, stationInfo) {
  let startIndex = null;
  let endIndex = null;

  for (let i in stops) {
    const station = stationInfo[stops[i].station];

    if (station.city === startCityId) {
      if (startIndex === null || station.preferred) startIndex = Number(i);
    }

    if (station.city === endCityId) {
      if (endIndex === null || station.preferred) endIndex = Number(i);
    }
  }

  // start or end are not in the stops
  if (startIndex === null || endIndex === null) return null;

  // wrong direction
  if (startIndex >= endIndex) return null;

  return stops.slice(startIndex, endIndex + 1);
}

class Database {
  #cities;
  #stations;
  #connectionTemplates;
  #legs;

  #resolvedConnectionIdsByLeg;
  #resolvedConnectionsById;

  constructor(cities, stations, connections, legs) {
    this.#cities = cities;
    this.#stations = stations;
    this.#connectionTemplates = connections; // not yet specific to a leg
    this.#legs = legs;

    // this will be filled with all the connections the UI is interested in
    // should always be accessed using connectionsForLeg to make sure that leg has been indexed
    this.#resolvedConnectionIdsByLeg = {};
    this.#resolvedConnectionsById = {};
  }

  connection(id) {
    if (!this.#resolvedConnectionsById[id])
      throw new DatabaseError(`Unknown connection ${id}`);
    return this.#resolvedConnectionsById[id];
  }

  connectionsForLeg(leg) {
    // todo return list instead of dict?
    if (!this.#resolvedConnectionIdsByLeg[leg]) this.#indexLeg(leg);

    const connectionIds = this.#resolvedConnectionIdsByLeg[leg];
    if (connectionIds.length === 0)
      throw new DatabaseError(`No connections available for leg ${leg}`);

    const result = {};
    for (let id of connectionIds) {
      result[id] = this.connection(id);
    }

    return result;
  }

  city(cityId) {
    if (!this.#cities[cityId])
      throw new DatabaseError(`Unknown city ${cityId}`);
    return this.#cities[cityId];
  }

  station(stationId) {
    if (!this.#stations[stationId])
      throw new DatabaseError(`Unknown station ${stationId}`);

    return this.#stations[stationId];
  }

  citiesForLeg(leg) {
    const [startCityId, endCityId] = this.#resolveLeg(leg);
    return [this.city(startCityId), this.city(endCityId)];
  }

  cityNameForStation(stationId) {
    return this.city(this.station(stationId).city).name;
  }

  stationName(stationId) {
    return this.station(stationId).name;
  }

  get legs() {
    return this.#legs;
  }

  #indexLeg(leg) {
    const [startCityId, endCityId] = this.#resolveLeg(leg);

    this.#resolvedConnectionIdsByLeg[leg] = [];

    for (let connectionTemplate of this.#connectionTemplates) {
      const partial = getPartialStops(
        connectionTemplate.stops,
        startCityId,
        endCityId,
        this.#stations,
      );

      // there is no such part -> can not fulfill this leg with this connection
      if (partial === null) continue;

      // id suffix based on leg
      const leg = `${this.#cities[startCityId].name}-${this.#cities[endCityId].name}`;
      const id = `${connectionTemplate.id}X${leg}`;

      const connection = {
        id: id,
        leg: leg,
        type: connectionTemplate.type,
        stops: partial,
      };

      this.#resolvedConnectionIdsByLeg[leg].push(id);
      this.#resolvedConnectionsById[id] = connection;
    }
  }

  #resolveLeg(leg) {
    // todo this is temporary while we are setting things up with human-readable lag names
    const [startCityName, endCityName] = leg.split("-");
    if (!startCityName || !endCityName)
      throw new DatabaseError(`Invalid leg name ${leg}`);

    const startCityId = this.#cityNameToId(startCityName);
    const endCityId = this.#cityNameToId(endCityName);

    return [startCityId, endCityId];
  }

  // temporary utility method while we are still passing around human-readable lag names
  #cityNameToId(name) {
    for (let [id, city] of Object.entries(this.#cities)) {
      if (city.name === name) return Number(id);
    }
    throw new DatabaseError(`Unknown city ${name}`);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Database = Database;
  module.exports.DatabaseError = DatabaseError;
  module.exports.getPartialStops = getPartialStops;
}
