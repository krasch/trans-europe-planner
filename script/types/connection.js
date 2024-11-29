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
  constructor(train, date, name, type, stops) {
    this.name = name;
    this.type = type;
    this.stops = stops;

    this.start = stops[0];
    this.end = stops.at(-1);

    this.leg = new Leg(this.start.cityName, this.end.cityName);
    this.id = new ConnectionId(train, date, this.leg);
  }

  get isMultiday() {
    return this.start.departure.dateString !== this.end.arrival.dateString;
  }

  slice(startCity, endCity) {
    const sliced = this.#getPartialStops(this.stops, startCity, endCity);

    return new Connection(
      this.id.train,
      this.id.date,
      this.name,
      this.type,
      sliced,
    );
  }

  get trace() {
    return this.partialTrace(this.start.cityName, this.end.cityName);
  }

  hasStop(city) {
    for (let stop of this.stops) if (stop.cityName === city) return true;
    return false;
  }

  partialTrace(startCity, endCity) {
    const slice = this.#getPartialStops(this.stops, startCity, endCity);

    const directs = [];

    for (let i in slice) {
      if (i === "0") continue;
      if (slice[i - 1].cityId === slice[i].cityId) continue;

      directs.push(new Leg(slice[i - 1].cityName, slice[i].cityName));
    }

    return directs;
  }

  #getPartialStops(stops, startCity, endCity) {
    // nothing to be done
    if (startCity === this.start.cityName && endCity === this.end.cityName)
      return stops;

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
