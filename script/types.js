class IllegalCoordinateError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalCoordinate";
  }
}

class TooLongConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = "TooLongConnection";
  }
}

class Coordinates {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;

    if (this.latitude < -90 || this.latitude > 90)
      throw new IllegalCoordinateError(
        `Latitude is ${this.latitude}, should be in [-90, 90]`,
      );

    if (this.longitude < -180 || this.longitude > 180)
      throw new IllegalCoordinateError(
        `Longitude is ${this.longitude}, should be in [-180, 180]`,
      );
  }
}

class City {
  constructor(name, coordinates) {
    this.name = name; // todo name is not unique, need some id
    this.coordinates = coordinates;
  }
}

class Station {
  constructor(externalId, name, coordinates, city, preferred) {
    this.id = externalId;
    this.name = name;
    this.coordinates = coordinates;
    this.city = city;
    this.preferred = preferred;
  }
}

class Leg {
  constructor(startCity, endCity) {
    this.startCity = startCity;
    this.endCity = endCity;
  }

  get id() {
    return `${this.startCity.name}-${this.endCity.name}`;
  }
}

class Connection {
  constructor(id, displayId, type, stops) {
    this.startDateTime = stops[0].datetime;
    this.endDateTime = stops.at(-1).datetime;

    if (this.endDateTime.daysSince(this.startDateTime.dateString) > 0)
      throw new TooLongConnectionError(
        "Overnight connections currently not supported",
      );

    this.startStation = stops[0].station;
    this.endStation = stops.at(-1).station;

    this.leg = new Leg(this.startStation.city, this.endStation.city);
    this.id = `${this.startDateTime.dateString}X${id}X${this.leg.id}`;

    this.displayId = displayId;
    this.type = type;
    this.stops = stops;
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.IllegalCoordinateError = IllegalCoordinateError;
  module.exports.TooLongConnectionError = TooLongConnectionError;
  module.exports.Coordinates = Coordinates;
  module.exports.City = City;
  module.exports.Station = Station;
  module.exports.Leg = Leg;
  module.exports.Connection = Connection;
}
