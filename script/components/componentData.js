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
  connections = connections.slice(); // make a copy
  connections.sort((a, b) => a.start.departure.minutesSince(b.start.departure));
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

function getJourneySummary(connections) {
  connections = sortConnectionsByDeparture(connections);

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

function prepareDataForCalendar(state, database) {
  const data = [];

  if (!state.activeJourney) return data;

  const connectionIds = state.activeJourney.connectionIds;

  for (let i in connectionIds) {
    const leg = connectionIds[i].leg;
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
        active: connection.id.toString() === connectionIds[i].toString(),
        color: color,
      });
    }
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

function prepareDataForMap(state, database) {
  if (state.numJourneys === 0) {
    return [[], []];
  }

  const activeJourney = state.activeJourney;

  // order journeys such that the active journey is first and all other journeys follow after
  let journeyOrder = [];
  if (activeJourney) journeyOrder.push(activeJourney);
  journeyOrder = journeyOrder.concat(state.alternativeJourneys);

  // array that only allows one item with each key and quietly rejects updates
  // this works similar to a set but is much less cumbersome to work with.
  // because we are looping through active journey first, this makes sure that edges/cities for the
  // active journey are never overwritten
  const edges = new UniqueArray((edge) => edge.id);
  const cities = new UniqueArray((city) => city.id);

  for (let journey of journeyOrder) {
    const active = activeJourney !== null && journey.id === activeJourney.id;
    const connections = journey.connectionIds.map((c) =>
      database.connection(c),
    );

    let journeySummary = getJourneySummary(connections);

    let edgeStatus = "alternative";
    if (active) edgeStatus = "active";

    for (let i in connections) {
      let color = null;
      if (active) color = `rgb(${getColor(i)})`;

      for (let edge of connections[i].trace) {
        cities.push({
          id: edge.startCityName,
          color: color,
          stop: true,
          transfer: edge.startCityName === connections[i].start.cityName,
          active: active,
        });

        cities.push({
          id: edge.endCityName,
          color: color,
          stop: true,
          transfer: edge.endCityName === connections[i].end.cityName,
          active: active,
        });

        edges.push({
          id: edge.toAlphabeticString(),
          color: color,
          leg: connections[i].leg.toString(),
          journey: journey.id,
          journeyTravelTime: journeySummary.travelTime,
          status: edgeStatus,
        });
      }
    }
  }

  return [cities.data, edges.data];
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.getColor = getColor;
  module.exports.sortConnectionsByDeparture = sortConnectionsByDeparture;
  module.exports.getJourneySummary = getJourneySummary;
  module.exports.prepareDataForCalendar = prepareDataForCalendar;
  module.exports.prepareDataForMap = prepareDataForMap;
  module.exports.prepareInitialDataForMap = prepareInitialDataForMap;
}
