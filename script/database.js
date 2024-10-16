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

function getPartialConnection(stops, startCityId, endCityId, stationInfo) {
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

function getColour(journeyId) {
  const body = document.getElementsByTagName("body")[0];
  const style = getComputedStyle(body);

  const assignedColors = {
    journey1: style.getPropertyValue("--journey-green"),
    journey2: style.getPropertyValue("--journey-orange"),
    journey3: style.getPropertyValue("--journey-purple"),
  };

  return assignedColors[journeyId];
}

class Database {
  #cities;
  #stations;
  #connections;
  #cityNameToId;

  constructor(cities, stations, connections) {
    this.#cities = cities;
    this.#stations = stations;
    this.#connections = connections;

    this.#cityNameToId = new Map(
      Object.keys(this.#cities).map((c) => [this.#cities[c].name, Number(c)]), // todo why is Number necessary
    );
  }

  connectionsForLeg(startCity, endCity) {
    const result = [];

    for (let connection of this.#connections) {
      // get the part of the connection that makes up this leg
      const partial = getPartialConnection(
        connection.stops,
        startCity,
        endCity,
        this.#stations,
      );

      // there is no such part
      if (partial === null) continue;

      // id suffix based on leg
      const suffix = `${this.#cities[startCity].name}-${this.#cities[endCity].name}`;

      result.push({
        id: `${connection.id}X${suffix}`,
        type: connection.type,
        stops: partial,
      });
    }

    return result;
  }

  prepareDataForMap(journeys, active) {
    const journey = journeys[active].connections;
    const allLegs = Object.values(journeys).flatMap((j) => j.legs);

    const prepareData = (leg, active) => {
      const [startCity, endCity] = this.#resolveLeg(leg);
      return {
        id: leg,
        startCity: this.#cities[startCity],
        endCity: this.#cities[endCity],
        active: active,
      };
    };

    const data = [];
    const legsAlreadyAdded = [];

    // add active legs (coloured lines)
    Object.keys(journey).forEach((leg) => {
      if (legsAlreadyAdded.includes(leg)) return;
      data.push(prepareData(leg, true));
      legsAlreadyAdded.push(leg);
    });

    // add inactive legs (grey lines)
    allLegs.forEach((leg) => {
      if (legsAlreadyAdded.includes(leg)) return;
      data.push(prepareData(leg, false));
      legsAlreadyAdded.push(leg);
    });

    return [data, getColour(active)];
  }

  prepareDataForCalendar(journeys, active) {
    const data = [];

    const connections = journeys[active].connections;
    for (let [leg, activeConnection] of Object.entries(connections)) {
      const [startCity, endCity] = this.#resolveLeg(leg);

      for (let connection of this.connectionsForLeg(startCity, endCity)) {
        data.push({
          id: connection.id,
          displayId: connection.id.split("X")[1], // todo not nice
          type: connection.type,
          leg: leg,
          startStation: this.#stations[connection.stops[0].station].name,
          startDateTime: connection.stops[0].departure,
          endStation: this.#stations[connection.stops.at(-1).station].name,
          endDateTime: connection.stops.at(-1).arrival,
          active: connection.id === activeConnection,
          color: getColour(active),
        });
      }
    }
    return data;
  }

  prepareDataForJourneySelection(journeys, active) {
    const data = [];
    for (let journeyId in journeys) {
      data.push({
        id: journeyId,
        active: journeyId === active,
        color: getColour(journeyId),
      });
    }
    return data;
  }

  #resolveLeg(leg) {
    // todo this is stupid
    const [startCityName, endCityName] = leg.split("-");
    const startCity = this.#cityNameToId.get(startCityName);
    const endCity = this.#cityNameToId.get(endCityName);
    return [startCity, endCity];
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Database = Database;
  module.exports.getPartialConnection = getPartialConnection;
}
