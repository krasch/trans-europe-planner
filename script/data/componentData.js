import { CITY_NAME_TO_ID, getColor } from "../util.js";

let NUM_DAYS_CALENDAR = 3;

function toAlphabeticEdgeString(startCityName, endCityName) {
  const cities = [startCityName, endCityName];
  cities.sort();
  return toEdgeString(cities[0], cities[1]);
}

function toEdgeString(startCityName, endCityName) {
  return `${startCityName}->${endCityName}`;
}

export function humanReadableTimedelta(minutes) {
  const days = Math.floor(minutes / (60 * 24));
  minutes = minutes - days * (60 * 24);

  const hours = Math.floor(minutes / 60);
  minutes = minutes - hours * 60;

  let daysString = "";
  if (days > 0) daysString = `${days}d`;

  let hoursString = "";
  if (hours > 0) hoursString = `${hours}h`;

  let minutesString = "";
  if (minutes > 0) minutesString = `${minutes}min`;

  const result = [daysString, hoursString, minutesString];
  return result.filter((e) => e.length > 0).join(" ");
}

export function prepareDataForCalendar(calendarStartDate, journeys, database) {
  const data = [];

  if (!journeys.hasActiveJourney) return data;

  const connectionsActiveJourney = journeys.activeJourney.connections(database);

  const dates = [];
  for (let i = 0; i < NUM_DAYS_CALENDAR; i++)
    dates.push(calendarStartDate.plus({ days: i }));

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
        startStation: option.startStationName,
        startDateTime: option.departure,
        endStation: option.endStationName,
        endDateTime: option.arrival,
        color: getColor(i),
        selected:
          option.id === currentlyChosenConnection.id &&
          option.date.toString() === currentlyChosenConnection.date.toString(),
      });
    }
  }
  return data;
}

export function prepareDataForPerlschnur(journeys, database) {
  const data = {
    summary: {},
    transfers: [],
    connections: [],
  };

  if (!journeys.hasActiveJourney) return data;

  const summary = journeys.activeJourney.summary(database);
  data.summary = {
    from: summary.from,
    to: summary.to,
    totalTime: humanReadableTimedelta(summary.travelTime),
    via: summary.via.length > 0 ? "via " + summary.via.join(", ") : "",
  };

  const connectionsActiveJourney = journeys.activeJourney.connections(database);
  for (let i = 0; i < connectionsActiveJourney.length; i++) {
    const connection = connectionsActiveJourney[i];

    data.connections.push({
      color: getColor(i),
      name: connection.name,
      type: connection.type,
      travelTime: humanReadableTimedelta(connection.travelTime),
      stops: connection.stops.map((s, idx) => {
        const datetime = idx === 0 ? s.departure : s.arrival;
        return {
          station: s.stationName,
          time: datetime.toFormat("HH:mm"),
          date: `(${datetime.toFormat("d LLL")})`,
        };
      }),
    });

    if (i >= connectionsActiveJourney.length - 1) continue;

    const nextConnection = connectionsActiveJourney[i + 1];
    data.transfers.push({
      time: humanReadableTimedelta(connection.transferTime(nextConnection)),
    });
  }

  // todo insanity
  const toRemove = [[0, 0]];
  for (let i = 0; i < data.connections.length; i++) {
    for (let j = 0; j < data.connections[i].stops.length - 1; j++) {
      if (
        data.connections[i].stops[j].date ===
        data.connections[i].stops[j + 1].date
      )
        toRemove.push([i, j + 1]);
    }
    if (i < data.connections.length - 1)
      if (
        data.connections[i].stops.at(-1).date ===
        data.connections[i + 1].stops[0].date
      )
        toRemove.push([i + 1, 0]);
  }

  for (let [i, j] of toRemove) delete data.connections[i].stops[j].date;

  return data;
}

export function prepareInitialDataForMap(
  home,
  cityInfo,
  connections,
  routeDatabase,
) {
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

export function prepareDataForMap(journeys, database) {
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
