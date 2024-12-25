let NUM_DAYS_CALENDAR = 3;

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

function shiftDate(date, deltaDays) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

function sortByDepartureTime(connections) {
  connections.sort((c1, c2) => c1.stops[0].departure - c2.stops[0].departure);
}

function toAlphabeticEdgeString(startCityName, endCityName) {
  const cities = [startCityName, endCityName];
  cities.sort();
  return toEdgeString(cities[0], cities[1]);
}

function toEdgeString(startCityName, endCityName) {
  return `${startCityName}->${endCityName}`;
}

function prepareDataForCalendar(calendarStartDate, journeys, database) {
  const data = [];

  if (!journeys.hasActiveJourney) return data;

  const connectionsActiveJourney = journeys.activeJourney.connections(database);

  const dates = [];
  for (let i = 0; i < NUM_DAYS_CALENDAR; i++)
    dates.push(shiftDate(calendarStartDate, i));

  for (let i in connectionsActiveJourney) {
    const currentlyChosenConnection = connectionsActiveJourney[i];

    let connectionsForLeg = database.connectionsForLeg(
      currentlyChosenConnection.startCityName,
      currentlyChosenConnection.endCityName,
      dates,
    );

    for (let option of connectionsForLeg) {
      const legString = toEdgeString(option.startCityName, option.endCityName);

      data.push({
        uniqueId: option.uniqueId,
        // used for communicating with map
        leg: legString,
        // for display
        name: option.name,
        type: option.type,
        startStation: option.stops[0].stationName,
        startDateTime: option.stops[0].departure,
        endStation: option.stops.at(-1).stationName,
        endDateTime: option.stops.at(-1).arrival,
        color: getColor(i),
        selected:
          option.id === currentlyChosenConnection.id &&
          option.date.toString() === currentlyChosenConnection.date.toString(),
      });
    }
  }
  return data;
}

function prepareInitialDataForMap(home, cityInfo, connections, routeDatabase) {
  const cities = { geo: {}, defaults: {} };
  const edges = { geo: {}, defaults: {} };

  for (let c of connections) {
    for (let cityName of c.cities) {
      if (cities.geo[cityName] !== undefined) continue; // already done this city

      const id = CITY_NAME_TO_ID[cityName];

      const routes = routeDatabase.getRoutes(home, cityName);

      cities.geo[id] = {
        name: cityInfo[id].name,
        lngLat: [cityInfo[id].longitude, cityInfo[id].latitude],
      };
      cities.defaults[id] = {
        rank: routes.length > 0 ? 2 : cityInfo[id].rank,
        isHome: cityInfo[id].name === home ?? false,
        isDestination: routes.length > 0,
        numTransfer: Math.min(...routes.map((r) => r.length)) - 1,
      };
      cities.defaults[id].isVisible =
        cities.defaults[id].isHome || cities.defaults[id].isDestination;
    }

    for (let edge of c.edges) {
      const id = toAlphabeticEdgeString(edge.startCityName, edge.endCityName);
      if (edges.geo[id] !== undefined) continue; // already done this edge

      const start = cityInfo[CITY_NAME_TO_ID[edge.startCityName]];
      const end = cityInfo[CITY_NAME_TO_ID[edge.endCityName]];

      edges.geo[id] = {
        startLngLat: [start.longitude, start.latitude],
        endLngLat: [end.longitude, end.latitude],
      };
      edges.defaults[id] = { isVisible: false };
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

    const connections = journey.connections(database);
    journeyInfo[journey.id] = journey.summary(database); // also calls journey.connections :-(

    for (let i in connections) {
      const color = active ? `rgb(${getColor(i)})` : null;

      for (let j in connections[i].cities) {
        const cityName = connections[i].cities[j];
        const id = CITY_NAME_TO_ID[cityName];

        const isTransfer = j === "0" || Number(j) === connections[i].length - 1;

        // get current data for this city or init new if first time we see this city
        const data = cities[id] ?? {};

        // updated carefully to make sure we don't overwrite data from active journey
        data.isVisible = true;
        data.isStop = true;
        if (data.circleColor === null || active) data.circleColor = color;
        if (data.isTransfer === null || active) data.isTransfer = isTransfer;

        cities[id] = data;
      }

      for (let edge of connections[i].edges) {
        const id = toAlphabeticEdgeString(edge.startCityName, edge.endCityName);
        const leg = toEdgeString(
          connections[i].startCityName,
          connections[i].endCityName,
        );

        // get current state data for this edge or init new if first time we see this edge
        const state = edges.state[id] ?? {};

        // update carefully to make sure we don't overwrite data from active journey
        state.isActive = state.isActive || active;
        state.isVisible = true;
        if (!state.color || active) state.color = color;
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
  module.exports.sortByDepartureTime = sortByDepartureTime;
  module.exports.prepareDataForCalendar = prepareDataForCalendar;
  module.exports.prepareDataForMap = prepareDataForMap;
  module.exports.prepareInitialDataForMap = prepareInitialDataForMap;
}
