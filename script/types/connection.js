class InvalidConnectionIdFormat extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidConnectionId";
  }
}

class InvalidLegFormat extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidLegFormat";
  }
}

class SlicingError extends Error {
  constructor(connectionId, startCity, endCity) {
    super(
      `Slice ${startCity} -> ${endCity} not available for connection ${connectionId}`,
    );
    this.name = "SlicingError";
  }
}

function shiftDate(date, deltaDays) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

function dateOnlyISOString(date) {
  return date.toLocaleDateString("sv");
}

class Leg {
  constructor(startCityName, endCityName) {
    this.startCityName = startCityName;
    this.endCityName = endCityName;
  }

  toString() {
    return `${this.startCityName}->${this.endCityName}`;
  }

  toAlphabeticString() {
    const cities = [this.startCityName, this.endCityName];
    cities.sort();

    return `${cities[0]}->${cities[1]}`;
  }

  static fromString(string) {
    const [cityA, cityB] = string.split("->");
    if (!cityA || !cityB) throw new InvalidLegFormat(string);

    return new Leg(cityA, cityB);
  }
}

class ConnectionId {
  constructor(train, date, leg) {
    this.train = train;
    this.date = date;
    this.leg = leg;
  }

  toString() {
    return `${this.train}XXX${this.date}XXX${this.leg.toString()}`;
  }

  static fromString(string) {
    const [train, date, leg] = string.split("XXX");
    if (!train || !date || !leg) throw new InvalidConnectionIdFormat(string);

    return new ConnectionId(train, date, Leg.fromString(leg));
  }
}

class Connection {
  constructor(id, name, type, stops) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.stops = stops;

    this.date = new Date(this.stops[0].departure.toLocaleDateString("sv")); // perhaps should be string?
    this.startCityName = this.stops[0].cityName;
    this.endCityName = this.stops.at(-1).cityName;
  }

  get uniqueId() {
    return {
      id: this.id,
      date: this.date,
      startCityName: this.startCityName,
      endCityName: this.endCityName,
    };
  }

  get isMultiday() {
    const start = this.stops[0].departure;
    const end = this.stops.at(-1).arrival;

    return (
      start.getFullYear() !== end.getFullYear() ||
      start.getMonth() !== end.getMonth() ||
      start.getDate() !== end.getDate()
    );
  }

  slice(startCity, endCity) {
    const sliced = this.#getPartialStops(this.stops, startCity, endCity);
    return new Connection(this.id, this.name, this.type, sliced);
  }

  changeDate(newDepartureDate) {
    const diffTime = newDepartureDate - this.stops[0].departure;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const stops = [];

    for (let stop of this.stops) {
      const copy = structuredClone(stop);
      copy.arrival = shiftDate(copy.arrival, diffDays);
      copy.departure = shiftDate(copy.departure, diffDays);
      stops.push(copy);
    }

    return new Connection(this.id, this.name, this.type, stops);
  }

  get edges() {
    const edges = [];

    const cities = this.cities;
    for (let i in cities) {
      if (i === "0") continue;

      edges.push(new Leg(cities[i - 1], cities[i]));
    }

    return edges;
  }

  get cities() {
    const cities = [this.stops[0].cityName];

    for (let i in this.stops) {
      if (i === "0") continue;
      if (this.stops[i - 1].cityId === this.stops[i].cityId) continue;
      cities.push(this.stops[i].cityName);
    }

    return cities;
  }

  hasStop(city) {
    for (let stop of this.stops) if (stop.cityName === city) return true;
    return false;
  }

  #getPartialStops(stops, startCity, endCity) {
    let startIndex = null;
    let endIndex = null;

    for (let i in stops) {
      if (stops[i].cityName === startCity) {
        if (startIndex === null || stops[i].stationIsPreferred)
          startIndex = Number(i);
      }

      if (stops[i].cityName === endCity) {
        if (endIndex === null || stops[i].stationIsPreferred)
          endIndex = Number(i);
      }
    }

    // start or end are not in the stops
    if (startIndex === null || endIndex === null)
      throw new SlicingError(this.id, startCity, endCity);

    // wrong direction
    if (startIndex >= endIndex)
      throw new SlicingError(this.id, startCity, endCity);

    return stops.slice(startIndex, endIndex + 1);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Connection = Connection;
  module.exports.ConnectionId = ConnectionId;
  module.exports.Leg = Leg;
  module.exports.SlicingError = SlicingError;
}
