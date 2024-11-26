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
    if (sliced == null) return null;

    return new Connection(
      this.id.train,
      this.id.date,
      this.name,
      this.type,
      sliced,
    );
  }

  get trace() {
    const directs = [];

    for (let i in this.stops) {
      if (i === "0") continue;
      if (this.stops[i - 1].cityId === this.stops[i].cityId) continue;

      directs.push(new Leg(this.stops[i - 1].cityName, this.stops[i].cityName));
    }

    return directs;
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
    if (startIndex === null || endIndex === null) return null;

    // wrong direction
    if (startIndex >= endIndex) return null;

    return stops.slice(startIndex, endIndex + 1);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Connection = Connection;
  module.exports.ConnectionId = ConnectionId;
  module.exports.Leg = Leg;
}
