class SlicingError extends Error {
  constructor(connectionId, startCity, endCity) {
    super(
      `Slice ${startCity} -> ${endCity} not available for connection ${connectionId}`,
    );
    this.name = "SlicingError";
  }
}

class Stop {
  constructor(
    arrival,
    departure,
    stationId,
    stationName,
    stationIsPreferred,
    cityId,
    cityName,
  ) {
    this.arrival = arrival;
    this.departure = departure;
    this.stationId = stationId;
    this.stationName = stationName;
    this.stationIsPreferred = stationIsPreferred;
    this.cityId = cityId;
    this.cityName = cityName;
  }

  shiftDate(numDays) {
    return new Stop(
      this.arrival.plus({ days: numDays }),
      this.departure.plus({ days: numDays }),
      this.stationId,
      this.stationName,
      this.stationIsPreferred,
      this.cityId,
      this.cityName,
    );
  }
}

class Connection {
  constructor(id, name, type, stops) {
    this.id = id; // this is the original ID of the connection template, it is not unique!
    this.name = name;
    this.type = type;
    this.stops = stops;

    const first = this.stops[0];
    const last = this.stops.at(-1);

    this.startStationName = first.stationName;
    this.endStationName = last.stationName;
    this.startCityName = first.cityName;
    this.endCityName = last.cityName;

    this.departure = first.departure;
    this.arrival = last.arrival;
    this.travelTime = last.arrival.diff(first.departure).as("minutes");

    this.date = first.departure.startOf("day"); // todo can be string?
    this.uniqueId = {
      id: this.id,
      date: this.date,
      startCityName: first.cityName,
      endCityName: last.cityName,
    };
  }

  get isMultiday() {
    const start = this.departure.startOf("day");
    const end = this.arrival.startOf("day");

    return start.toMillis() !== end.toMillis();
  }

  slice(startCity, endCity) {
    return new Connection(
      this.id,
      this.name,
      this.type,
      this.#getPartialStops(this.stops, startCity, endCity),
    );
  }

  changeDate(newDepartureDate) {
    const diffDays = newDepartureDate
      .diff(this.departure.startOf("day"), "days")
      .as("days");

    return new Connection(
      this.id,
      this.name,
      this.type,
      this.stops.map((s) => s.shiftDate(diffDays)),
    );
  }

  get edges() {
    const edges = [];

    const cities = this.cities;
    for (let i in cities) {
      if (i === "0") continue;

      edges.push({ startCityName: cities[i - 1], endCityName: cities[i] });
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

  transferTime(nextConnection) {
    return nextConnection.departure.diff(this.arrival).as("minutes");
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
  module.exports.Stop = Stop;
  module.exports.Connection = Connection;
  module.exports.SlicingError = SlicingError;
}
