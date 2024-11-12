class InvalidDatetimeFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidDateTimeFormat";
  }
}

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

class CustomDateTime {
  constructor(dateString, timeString) {
    // todo error when wrongly formatted?
    // todo should not have to do this anyway, should export proper timezoned datetimes
    this.datetime = new Date(dateString + " " + timeString);

    if (this.datetime.getSeconds() !== 0)
      throw new InvalidDatetimeFormatError(
        `Seconds not allowed in time format: ${timeString}, ${this.datetime}`,
      );
  }

  compareTo(other) {
    return this.valueOf() - other.valueOf();
  }

  valueOf() {
    return this.datetime.getTime(); // unix ts
  }

  get dateString() {
    return this.datetime.toISOString().slice(0, 10);
  }

  get timeString() {
    const hours = this.datetime.getHours().toString();
    const minutes = this.datetime.getMinutes().toString();
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  get minutesSinceMidnight() {
    const hours = this.datetime.getHours();
    const minutes = this.datetime.getMinutes();
    return hours * 60 + minutes;
  }

  minutesSince(other) {
    const diffMilliseconds = this.datetime - other.datetime;
    // floor should not be necessary, value should be whole number anyway because we disallow seconds
    return Math.floor(diffMilliseconds / 1000.0 / 60.0);
  }

  daysSince(dateString) {
    const other = new CustomDateTime(dateString, "00:00:00");
    const diffMilliseconds = this.datetime - other.datetime;
    return Math.floor(diffMilliseconds / 1000.0 / 60.0 / 60.0 / 24.0);
  }

  humanReadableSince(other) {
    let minutes = this.minutesSince(other);
    if (minutes < 0)
      throw Error("Can't do human-redable since with negative diff");

    const days = Math.floor(minutes / (60 * 24));
    minutes = minutes - days * (60 * 24);

    const hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    let daysString = "";
    if (days > 0) daysString = `${days}d`;

    let hoursString = "";
    if (hours > 0) hoursString = `${hours}h`;

    let minutesString = "";
    if (minutes > 0) minutesString = `${minutes}min`;

    const result = [daysString, hoursString, minutesString];
    return result.filter((e) => e.length > 0).join(" ");
  }
}

function getPartialStops(stops, startCity, endCity) {
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
    const sliced = getPartialStops(this.stops, startCity, endCity);
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
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.CustomDateTime = CustomDateTime;
  module.exports.InvalidDatetimeFormatError = InvalidDatetimeFormatError;
  module.exports.Connection = Connection;
  module.exports.ConnectionId = ConnectionId;
  module.exports.Leg = Leg;
}
