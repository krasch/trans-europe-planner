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

class UniqueArray {
  #doneKeys = [];

  constructor(uniqueKeyFn) {
    this.uniqueKeyFn = uniqueKeyFn;
    this.data = [];
  }

  push(item) {
    const key = this.uniqueKeyFn(item);
    if (!this.#doneKeys.includes(key)) {
      this.data.push(item);
      this.#doneKeys.push(key);
    }
  }
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

    const connectionsForLeg = database.connectionsForLeg(leg);
    sortConnectionsByDeparture(connectionsForLeg);

    for (let connection of connectionsForLeg) {
      data.push({
        id: connection.id.toString(),
        displayId: connection.name,
        type: connection.type,
        leg: connection.leg.toString(),
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

function prepareInitialDataForMap(cityInfo, connections) {
  const cityNameToId = {};
  for (let id in cityInfo) cityNameToId[cityInfo[id].name] = id;

  // array that only allows one item with each key and quietly rejects updates
  // this works similar to a set but is much less cumbersome to work with
  const edges = new UniqueArray((edge) => edge.id);
  const cities = new UniqueArray((city) => city.name); // todo id

  for (let c of connections) {
    for (let edge of c.trace) {
      cities.push(cityInfo[cityNameToId[edge.startCityName]]);
      cities.push(cityInfo[cityNameToId[edge.endCityName]]);

      edges.push({
        id: edge.toAlphabeticString(),
        startCity: cityInfo[cityNameToId[edge.startCityName]],
        endCity: cityInfo[cityNameToId[edge.endCityName]],
      });
    }
  }

  return [cities.data, edges.data];
}

function prepareDataForMap(journeys, activeId, database) {
  if (activeId == null) {
    return []; // todo is correct?
  }

  // order journeys such that the active journey is first and all other journeys follow after
  const journeyOrder = [activeId];
  for (let journeyId in journeys)
    if (journeyId !== activeId) journeyOrder.push(journeyId);

  // array that only allows one item with each key and quietly rejects updates
  // this works similar to a set but is much less cumbersome to work with
  // because we are looping through active journey first, this makes sure that edges/cities for the
  // active journey are never overwritten
  const edges = new UniqueArray((edge) => edge.id);
  const cities = new UniqueArray((city) => city.name); // todo id

  for (let journeyId of journeyOrder) {
    const journey = journeys[journeyId];
    const connections = getSortedJourneyConnections(journey, database);

    let edgeStatus = "alternative";
    if (journeyId === activeId) edgeStatus = "active";

    for (let i in connections) {
      let color = null;
      if (journeyId === activeId) color = getColor(i);

      for (let edge of connections[i].trace) {
        cities.push({
          name: edge.startCityName,
          color: color,
          transfer: edge.startCityName === connections[i].start.cityName,
          active: journeyId === activeId,
        });

        cities.push({
          name: edge.endCityName,
          color: color,
          transfer: edge.endCityName === connections[i].end.cityName,
          active: journeyId === activeId,
        });

        edges.push({
          id: edge.toAlphabeticString(),
          color: color,
          leg: connections[i].leg.toString(),
          journey: journeyId,
          status: edgeStatus,
        });
      }
    }
  }

  return [cities.data, edges.data];
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
  module.exports.prepareInitialDataForMap = prepareInitialDataForMap;
}
