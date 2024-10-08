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

class LegHoverEvent {
  constructor(leg) {
    this.event = new CustomEvent("legHover", {
      detail: { leg: leg },
    });
  }

  dispatch(host) {
    host.dispatchEvent(this.event);
  }
}

class LegNoHoverEvent {
  constructor(leg) {
    this.event = new CustomEvent("legNoHover", { detail: { leg: leg } });
  }

  dispatch(host) {
    host.dispatchEvent(this.event);
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
  constructor(externalId, name, coordinates, city) {
    this.id = externalId;
    this.name = name;
    this.coordinates = coordinates;
    this.city = city;
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
    this.id = `${this.startDateTime.dateString}X${id}`;

    this.displayId = displayId;
    this.type = type;
    this.stops = stops;
  }
}

class Journey {
  constructor(connections) {
    this.connections = connections; // todo check validity of this journey
  }

  addConnection(connection) {
    this.connections.push(connection);
  }

  removeConnection(leg) {
    this.connections = this.connections.filter((c) => {
      return leg !== c.leg.id;
    });
  }

  changeLeg(leg, newConnection) {
    // todo shitty datatypes, todo what if legs exists 0 or >1 times
    for (const i in this.connections) {
      if (this.connections[i].leg.id === leg) {
        this.connections[i] = newConnection;
      }
    }
  }

  get stopovers() {
    const cities = [];

    if (this.connections.length === 0) return cities;

    for (let connection of this.connections) {
      cities.push(connection.startStation.city);
    }
    cities.push(this.connections.at(-1).endStation.city);
    return cities;
  }

  get legs() {
    return this.connections.map((c) => c.leg);
  }

  hasLeg(leg) {
    for (let connection of this.connections) {
      if (connection.leg.id === leg.id) return true;
    }
    return false;
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
  module.exports.Journey = Journey;
}
