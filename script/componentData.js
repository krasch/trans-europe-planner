class Journey {
  constructor(defaultConnections) {
    this.defaults = defaultConnections;
    this.connections = {};
  }

  get legs() {
    return Object.keys(this.defaults);
  }

  static fromDefaults(defaultConnections) {
    const journey = new Journey(defaultConnections);
    for (let leg in defaultConnections)
      journey.connections[leg] = defaultConnections[leg];
    return journey;
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
  const connections = [];
  for (let [leg, connectionId] of Object.entries(journey.connections))
    connections.push(database.connectionForLegAndId(leg, connectionId));

  const startStation = connections[0].stops[0].station;
  const endStation = connections.at(-1).stops.at(-1).station;

  const startCity = database.cityNameForStation(startStation);
  const endCity = database.cityNameForStation(endStation);

  // todo write saner
  const vias = [];
  if (connections.length > 1) {
    for (let c of connections) {
      const arrival = database.cityNameForStation(c.stops[0].station);
      const departure = database.cityNameForStation(c.stops.at(-1).station);
      if (!vias.includes(arrival) && ![startCity, endCity].includes(arrival))
        vias.push(arrival);
      if (
        !vias.includes(departure) &&
        ![startCity, endCity].includes(departure)
      )
        vias.push(departure);
    }
  }

  let viasString = "";
  if (vias.length > 0) viasString = ` via ${vias.join(", ")}`;

  return `From ${startCity} to ${endCity}${viasString}`;
}

function prepareDataForCalendar(journeys, activeId, datatabase) {
  const data = [];

  const connections = journeys[activeId].connections;
  for (let [leg, activeConnection] of Object.entries(connections)) {
    for (let connection of Object.values(datatabase.connectionsForLeg(leg))) {
      data.push({
        id: connection.id,
        displayId: connection.id.split("X")[1], // todo not nice
        type: connection.type,
        leg: leg,
        startStation: datatabase.stationName(connection.stops[0].station),
        startDateTime: connection.stops[0].departure,
        endStation: datatabase.stationName(connection.stops.at(-1).station),
        endDateTime: connection.stops.at(-1).arrival,
        active: connection.id === activeConnection,
        color: getColour(activeId),
      });
    }
  }
  return data;
}

function prepareDataForJourneySelection(journeys, activeId, database) {
  const data = [];

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
  const legsInJourney = journeys[activeId].legs;
  const allLegs = Object.values(journeys).flatMap((j) => j.legs);

  const prepareData = (leg, isActive) => {
    const [startCity, endCity] = database.citiesForLeg(leg);
    return {
      id: leg,
      startCity: startCity,
      endCity: endCity,
      active: isActive,
    };
  };

  const data = [];
  const legsAlreadyAdded = [];

  // add active legs (coloured lines)
  legsInJourney.forEach((leg) => {
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

  return [data, getColour(activeId)];
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
