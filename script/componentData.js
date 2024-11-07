class JourneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "JourneyError";
  }
}

class Journey {
  #connections;
  #cache;

  constructor(connectionsByLegs) {
    this.#connections = connectionsByLegs;
    this.#cache = {};
  }

  get unsortedConnections() {
    if (this.#connections.length === 0) return [];
    return Object.values(this.#connections);
  }

  get unsortedLegs() {
    return Object.keys(this.#connections);
  }

  setConnectionForLeg(leg, connection) {
    this.#connections[leg] = connection;
  }

  removeLeg(leg) {
    if (!this.#connections[leg])
      throw new JourneyError(`Can not remove non-existing leg ${leg}`);
    this.#cache[leg] = this.#connections[leg];
    delete this.#connections[leg];
  }

  previousConnection(leg) {
    if (this.#connections[leg])
      throw new JourneyError(`Leg is currently active`);
    return this.#cache[leg];
  }
}

function getColour(journeyId) {
  const body = document.getElementsByTagName("body")[0];
  const style = getComputedStyle(body);

  const assignedColors = {
    journey1: style.getPropertyValue("--journey-green"),
    journey2: style.getPropertyValue("--journey-orange"),
    journey3: style.getPropertyValue("--journey-purple"),
  };

  // for unit tests mostly todo could be nicer
  const backupColors = {
    journey1: "0, 255, 0",
    journey2: "255, 0, 0",
    journey3: "0, 0, 255",
  };

  for (let j in assignedColors)
    if (assignedColors[j].length === 0) assignedColors[j] = backupColors[j];

  return assignedColors[journeyId];
}

function getJourneySummary(journey, database) {
  // look up all the necessary data from the database
  const connections = [];
  for (let connectionId of journey.unsortedConnections) {
    const connection = database.connection(connectionId);

    const firstStop = connection.stops[0];
    const lastStop = connection.stops.at(-1);

    connections.push({
      first: {
        city: database.cityNameForStation(firstStop.station),
        dateTime: firstStop.departure,
      },
      last: {
        city: database.cityNameForStation(lastStop.station),
        dateTime: lastStop.arrival,
      },
    });
  }

  // sort by departure time
  connections.sort((a, b) => a.first.dateTime.minutesSince(b.first.dateTime));

  const startCity = connections[0].first.city;
  const endCity = connections.at(-1).last.city;

  const startTime = connections[0].first.dateTime;
  const endTime = connections.at(-1).last.dateTime;
  const travelTime = endTime.humanReadableSince(startTime);

  const vias = [];
  for (let c of connections) {
    for (let city of [c.first.city, c.last.city]) {
      if (city !== startCity && city !== endCity && !vias.includes(city))
        vias.push(city);
    }
  }

  let viasString = "";
  if (vias.length > 0) viasString = ` via ${vias.join(", ")}`;

  return `From ${startCity} to ${endCity}${viasString}<br/>${travelTime}`;
}

function prepareDataForCalendar(journeys, activeId, datatabase) {
  const data = [];

  if (activeId == null) return data;

  const activeConnections = journeys[activeId].unsortedConnections;

  for (let leg of journeys[activeId].unsortedLegs) {
    for (let connection of datatabase.connectionsForLeg(leg)) {
      data.push({
        id: connection.id,
        displayId: connection.name,
        type: connection.type,
        leg: connection.leg,
        startStation: datatabase.stationName(connection.stops[0].station),
        startDateTime: connection.stops[0].departure,
        endStation: datatabase.stationName(connection.stops.at(-1).station),
        endDateTime: connection.stops.at(-1).arrival,
        active: activeConnections.includes(connection.id),
        color: getColour(activeId),
      });
    }
  }
  return data;
}

function prepareDataForJourneySelection(journeys, activeId, database) {
  const data = [];

  if (activeId == null) return data;

  for (let journeyId in journeys) {
    data.push({
      id: journeyId,
      active: journeyId === activeId,
      summary: getJourneySummary(journeys[journeyId], database),
      color: getColour(journeyId),
    });
  }

  return data;
}

function prepareDataForMap(journeys, activeId, database) {
  const allLegs = database.legs;

  let activeConnections = [];
  let activeLegs = [];

  if (activeId != null) {
    activeConnections = journeys[activeId].unsortedConnections;
    activeLegs = activeConnections.map((c) => database.connection(c).leg);
  }

  const data = allLegs.map((leg) => {
    const [startCity, endCity] = database.citiesForLeg(leg);
    return {
      id: leg,
      startCity: startCity,
      endCity: endCity,
      active: activeLegs.includes(leg),
    };
  });

  let colour = null;
  if (activeId != null) colour = getColour(activeId);

  return [data, colour];
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Journey = Journey;
  module.exports.getJourneySummary = getJourneySummary;
  module.exports.prepareDataForCalendar = prepareDataForCalendar;
  module.exports.prepareDataForJourneySelection =
    prepareDataForJourneySelection;
  module.exports.prepareDataForMap = prepareDataForMap;
}
