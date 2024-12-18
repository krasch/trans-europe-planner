let COLORS = [
  // backup colors (mostly for tests)
  "0, 255, 0",
  "255, 0, 0",
  "0, 0, 255",
  "255, 255, 0",
  "255, 0, 255",
];

function initColors() {
  const body = document.getElementsByTagName("body")[0];
  const style = getComputedStyle(body);

  COLORS = [
    style.getPropertyValue("--color1"),
    style.getPropertyValue("--color2"),
    style.getPropertyValue("--color3"),
    style.getPropertyValue("--color4"),
    style.getPropertyValue("--color5"),
  ];
}

let CITY_NAME_TO_ID = {};

function initCityNameToId(cities) {
  for (let id in cities) CITY_NAME_TO_ID[cities[id].name] = String(id);
}

function getColor(i) {
  return COLORS[i % COLORS.length];
}

function sortConnectionsByDeparture(connections) {
  connections = connections.slice(); // make a copy
  connections.sort((a, b) => a.start.departure.minutesSince(b.start.departure));
  return connections;
}

function getSortedJourneyConnections(journey, database) {
  const connections = journey.connectionIds.map((c) => database.connection(c));
  return sortConnectionsByDeparture(connections);
}

function getJourneySummary(connections) {
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

  let numTransfer = "direkt (ohne Umstieg)";
  if (vias.length === 1) {
    numTransfer = `${vias.length} Umstieg: `;
  } else if (vias.length > 1) {
    numTransfer = `${vias.length} Umstiege: `;
  }

  return {
    from: startCity,
    to: endCity,
    via: vias.join(", "),
    numTransfer: numTransfer,
    travelTime: travelTime,
  };
}

function prepareDataForCalendar(journeys, database) {
  const data = [];

  if (!journeys.activeJourney) return data;

  const connectionIds = journeys.activeJourney.connectionIds;

  for (let i in connectionIds) {
    const leg = connectionIds[i].leg;
    const color = getColor(i);

    let connectionsForLeg = database.connectionsForLeg(leg);
    connectionsForLeg = sortConnectionsByDeparture(connectionsForLeg);

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
        active: connection.id.toString() === connectionIds[i].toString(),
        color: color,
      });
    }
  }
  return data;
}

function prepareInitialDataForMap(home, cityInfo, connections) {
  const cities = { geo: {}, defaults: {} };
  const edges = { geo: {}, defaults: {} };

  for (let c of connections) {
    for (let cityName of c.cities) {
      const id = CITY_NAME_TO_ID[cityName];
      if (cities.geo[cityName] !== undefined) continue; // already done this city

      cities.geo[id] = {
        name: cityInfo[id].name,
        lngLat: [cityInfo[id].longitude, cityInfo[id].latitude],
      };
      cities.defaults[id] = {
        rank: cityInfo[id].rank,
        isHome: cityInfo[id].name === home,
        isDestination: cityInfo[id].routesAvailable,
      };
    }

    for (let edge of c.edges) {
      const id = edge.toAlphabeticString();
      if (edges.geo[id] !== undefined) continue; // already done this edge

      const start = cityInfo[CITY_NAME_TO_ID[edge.startCityName]];
      const end = cityInfo[CITY_NAME_TO_ID[edge.endCityName]];

      edges.geo[id] = {
        startLngLat: [start.longitude, start.latitude],
        endLngLat: [end.longitude, end.latitude],
      };
      edges.defaults[id] = {};
    }
  }

  return [cities, edges];
}

function prepareDataForMap(journeys, database) {
  const cities = {};
  const edges = { state: {}, mapping: {} };
  const journeyInfo = {};

  const activeJourney = journeys.activeJourney; // might be null
  for (let journey of journeys.journeys) {
    const active = activeJourney !== null && journey.id === activeJourney.id;
    const connections = getSortedJourneyConnections(journey, database); // only needs to be sorted for journey summary

    journeyInfo[journey.id] = getJourneySummary(connections);

    for (let i in connections) {
      const color = active ? `rgb(${getColor(i)})` : null;

      for (let cityName of connections[i].cities) {
        const id = CITY_NAME_TO_ID[cityName];
        const destination = journey.destination === cityName;

        // get current data for this city or init new if first time we see this city
        const data = cities[id] ?? {};

        // updated carefully to make sure we don't overwrite data from active journey
        data.circleVisible = true;
        if (active && !data.circleColor) data.circleColor = color;

        cities[id] = data;
      }

      for (let edge of connections[i].edges) {
        const id = edge.toAlphabeticString();
        const leg = connections[i].leg.toString();

        // get current state data for this edge or init new if first time we see this edge
        const state = edges.state[id] ?? {};

        // update carefully to make sure we don't overwrite data from active journey
        state.active = state.active || active;
        state.visible = true;
        if (active) state.color = color;
        // todo it it is not nice that I need this here and in mapping
        if (!state.leg || active) state.leg = leg;
        if (!state.journey || active) state.journey = journey.id;

        // same for mapping
        const mapping = edges.mapping[id] ?? { legs: [], journeys: [] };
        if (!mapping.legs.includes(leg)) mapping.legs.push(leg);
        if (!mapping.journeys.includes(mapping.id))
          mapping.journeys.push(journey.id);

        edges.state[id] = state;
        edges.mapping[id] = mapping;
      }
    }
  }

  return [cities, edges, journeyInfo];
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.getColor = getColor;
  module.exports.initCityNameToId = initCityNameToId;
  module.exports.sortConnectionsByDeparture = sortConnectionsByDeparture;
  module.exports.getJourneySummary = getJourneySummary;
  module.exports.prepareDataForCalendar = prepareDataForCalendar;
  module.exports.prepareDataForMap = prepareDataForMap;
  module.exports.prepareInitialDataForMap = prepareInitialDataForMap;
}
