class IllegalCoordinateError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalCoordinate";
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

    // todo formatting won't work with 0
    if (this.latitude === 0 || this.longitude === 0)
      throw new Error("Not supported");
  }

  get #idPrefix() {
    if (this.latitude >= 0 && this.longitude >= 0) return 1;
    if (this.latitude >= 0 && this.longitude < 0) return 2;
    if (this.latitude < 0 && this.longitude >= 0) return 3;
    if (this.latitude < 0 && this.longitude < 0) return 4;
  }

  get id() {
    const latitudeAsInt = Math.floor(Math.abs(this.latitude) * 10000);
    const longitudeAsInt = Math.floor(Math.abs(this.longitude) * 10000);
    return `${this.#idPrefix}${latitudeAsInt}${longitudeAsInt}`;
  }
}

class City {
  constructor(name, coordinates) {
    this.name = name;
    this.coordinates = coordinates;
  }
  get id() {
    return "city" + this.coordinates.id;
  }
}

class Station {
  constructor(name, coordinates, city) {
    this.name = name;
    this.coordinates = coordinates;
    this.city = city;
  }

  get id() {
    return "station" + this.coordinates.id;
  }
}

class Leg {
  constructor(startStation, endStation) {
    this.startStation = startStation;
    this.endStation = endStation;
  }

  get id() {
    return `leg${this.startStation.id}->${this.endStation.id}`;
  }
}

class Connection {
  constructor(id, displayId, type, date, stops) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    this.id = `${year}${month}${day}X${id}`;

    this.displayId = displayId;
    this.type = type;
    this.stops = stops;
    this.date = date;
    this.leg = new Leg(this.startStation, this.endStation);
  }

  get startStation() {
    return this.stops[0].station;
  }

  get startTime() {
    return this.stops[0].time; // todo date
  }

  get endStation() {
    return this.stops.at(-1).station;
  }

  get endTime() {
    return this.stops.at(-1).time; // todo date
  }
}

class Journey {
  constructor(connections) {
    this.connections = connections; // todo check validity of this journey
  }

  get stopovers() {
    const cities = [];
    for (let connection of this.connections) {
      cities.push(connection.startStation.city);
    }
    cities.push(this.connections.at(-1).endStation.city);
    return cities;
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.IllegalCoordinateError = IllegalCoordinateError;
  module.exports.Coordinates = Coordinates;
  module.exports.City = City;
  module.exports.Station = Station;
  module.exports.Leg = Leg;
  module.exports.Connection = Connection;
  module.exports.Journey = Journey;
}
