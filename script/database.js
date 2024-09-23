function parseStations() {
  const stations = new Map();
  const cities = new Map();

  for (let key in STATIONS) {
    const data = STATIONS[key];

    let city = new City(
      data.city,
      new Coordinates(data.city_latitude, data.city_longitude),
    );

    if (!cities.has(city.id)) cities[city.id] = city;
    city = cities[city.id];

    let station = new Station(
      data.name,
      new Coordinates(data.latitude, data.longitude),
      city,
    );
    stations[key] = station;
  }

  return stations;
}

function parseConnections(stations) {
  const connections = new Map();

  for (let outer in CONNECTIONS) {
    for (let inner in CONNECTIONS[outer]) {
      const connection = CONNECTIONS[outer][inner];

      // lookup station objects todo do not have all stations in our list
      for (let i in connection.stops) {
        connection.stops[i].station = stations[connection.stops[i].station];
      }

      for (let date of ["2023-10-16", "2023-10-17", "2023-10-18"]) {
        const datedConnection = new Connection(
          connection.id,
          connection.displayId,
          connection.type,
          new Date(date),
          connection.stops,
        );

        connections[datedConnection.id] = datedConnection;
      }
    }
  }

  return connections;
}

class Database {
  constructor() {
    this.stations = parseStations();
    this.connections = parseConnections(this.stations);
  }
}
