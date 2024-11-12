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

function getColor(i) {
  const body = document.getElementsByTagName("body")[0];
  const style = getComputedStyle(body);

  const colors = [
    style.getPropertyValue("--color1"),
    style.getPropertyValue("--color2"),
    style.getPropertyValue("--color3"),
    style.getPropertyValue("--color4"),
    style.getPropertyValue("--color5"),
  ];

  // for unit tests mostly todo could be nicer
  // can not use ?? above because style.getPropertyValue returns an empty string
  const backupColors = [
    "0, 255, 0",
    "255, 0, 0",
    "0, 0, 255",
    "255, 255, 0",
    "255, 0, 255",
  ];
  for (let j in colors) if (colors[j].length === 0) colors[j] = backupColors[j];

  return colors[i % colors.length];
}

function sortConnectionsByDeparture(connections) {
  // todo sorts in place
  connections.sort((a, b) => a.start.departure.minutesSince(b.start.departure));
}

function getSortedJourneyConnections(journey, database) {
  const connections = journey.unsortedConnections.map((c) =>
    database.connection(c),
  );
  sortConnectionsByDeparture(connections);
  return connections;
}

function getJourneySummary(journey, database) {
  const connections = getSortedJourneyConnections(journey, database);

  const startCity = connections[0].start.cityName;
  const endCity = connections.at(-1).end.cityName;

  const startTime = connections[0].start.departure;
  const endTime = connections.at(-1).end.arrival;
  const travelTime = endTime.humanReadableSince(startTime);

  const vias = [];
  for (let c of connections) {
    for (let city of [c.start.cityName, c.end.cityName]) {
      if (city !== startCity && city !== endCity && !vias.includes(city))
        vias.push(city);
    }
  }

  let viasString = "";
  if (vias.length > 0) viasString = ` via ${vias.join(", ")}`;

  return `From ${startCity} to ${endCity}${viasString}<br/>${travelTime}`;
}

function prepareDataForCalendar(journeys, activeId, database) {
  const data = [];

  if (activeId == null) return data;

  const connections = getSortedJourneyConnections(journeys[activeId], database);

  for (let i in connections) {
    const leg = connections[i].leg;
    const color = getColor(i);

    for (let connection of database.connectionsForLeg(leg)) {
      data.push({
        id: connection.id,
        displayId: connection.name,
        type: connection.type,
        leg: connection.leg,
        startStation: connection.start.stationName,
        startDateTime: connection.start.departure,
        endStation: connection.end.stationName,
        endDateTime: connection.end.arrival,
        active: connection.id === connections[i].id,
        color: color,
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
    });
  }

  return data;
}

function prepareDataForMap(journeys, activeId, database) {
  if (activeId == null) {
    return []; // todo is correct?
  }

  const legs = [];
  const done = [];

  // first for active journey
  const connections = getSortedJourneyConnections(journeys[activeId], database);
  for (let i in connections) {
    const color = getColor(i);
    for (let p2p of connections[i].pointToPoint) {
      legs.push({ p2p: p2p, color: color, leg: connections[i].leg });
      done.push(p2p);
    }
  }

  // then for other journeys
  // make sure to not overwrite what we did for active journey
  /*for (let journeyId in journeys) {
    if (journeyId === activeId) continue;

    const journey = journeys[journeyId];
    const connections = getSortedJourneyConnections(journey, database);

    for (let i in connections) {
      for (let leg of connections[i].pointToPoint) {
        if (done.includes(leg)) continue;

        legs.push({ leg: leg, color: null, hover: connections[i].leg });
        done.push(leg);
      }
    }
  }*/

  return legs;
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Journey = Journey;
  module.exports.getColor = getColor;
  module.exports.sortConnectionsByDeparture = sortConnectionsByDeparture;
  module.exports.getJourneySummary = getJourneySummary;
  module.exports.prepareDataForCalendar = prepareDataForCalendar;
  module.exports.prepareDataForJourneySelection =
    prepareDataForJourneySelection;
  module.exports.prepareDataForMap = prepareDataForMap;
}
