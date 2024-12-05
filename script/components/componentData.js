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
  for (let id in cities) CITY_NAME_TO_ID[cities[id].name] = id;
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

  let viasString = "";
  if (vias.length > 0) viasString = ` via ${vias.join(", ")}`;

  return {
    from: startCity,
    to: endCity,
    via: viasString,
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

function prepareInitialDataForMap(cityInfo, connections) {
  const cities = { geo: {}, defaults: {} };
  const edges = { geo: {}, defaults: {} };

  for (let c of connections) {
    for (let cityName of c.cities) {
      const id = CITY_NAME_TO_ID[cityName];
      if (cities.geo[cityName] !== undefined) continue; // already done this city

      cities.geo[cityName] = {
        name: cityInfo[id].name,
        lngLat: [cityInfo[id].longitude, cityInfo[id].latitude],
      };
      cities.defaults[cityName] = {
        rank: cityInfo[id].rank,
      };

      if (cityInfo[id].routesAvailable) {
        cities.defaults[cityName].markerIcon = "destination";
        cities.defaults[cityName].markerSize = "small";
        cities.defaults[cityName].markerColor = "light";
      }
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

function prepareDataForMap(home, journeys, database) {
  const cities = {};
  const edges = {};

  if (home) {
    cities[home] = {
      markerIcon: "home",
      markerSize: "large",
      markerColor: "dark",
    };
  }

  const activeJourney = journeys.activeJourney; // might be null
  for (let journey of journeys.journeys) {
    const active = activeJourney !== null && journey.id === activeJourney.id;
    const edgeStatus = active ? "active" : "alternative";

    const connections = getSortedJourneyConnections(journey, database); // only needs to be sorted for journey summary
    const journeySummary = getJourneySummary(connections);

    for (let i in connections) {
      const color = active ? `rgb(${getColor(i)})` : null;

      for (let city of connections[i].cities) {
        const destination = journey.destination === city;

        // get current data for this city or init new if first time we see this city
        const data = cities[city] ?? {};

        // updated carefully to make sure we don't overwrite data from active journey
        if (!data.symbol || active) data.symbol = "circle";
        if (!data.symbolColor && active) data.symbolColor = color;

        if (destination) {
          data.markerSize = "large";
        }

        cities[city] = data;
      }

      for (let edge of connections[i].edges) {
        const id = edge.toAlphabeticString();

        // we already have data for this edge and the current journey is not an active one
        // -> don't overwrite data, just move on
        if (edges[id] !== undefined && !active) continue;

        edges[id] = {
          color: color,
          leg: connections[i].leg.toString(),
          journey: journey.id,
          journeyTravelTime: journeySummary.travelTime,
          status: edgeStatus,
        };
      }
    }
  }

  return [cities, edges];
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
