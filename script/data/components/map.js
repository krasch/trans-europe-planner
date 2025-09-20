import { Itinerary } from "script/types/itinerary.js";

import { getColor, identifiers } from "./_common.js";

/**
 * @typedef ExternalCityData city metadata supplied to this function
 * @property {string} id
 * @property {string} name
 * @property {number[]} lngLat
 * @property {boolean} [isDestination]
 *
 * @typedef {Object} InitialCityData city data returned by this function
 * @property {Object.<string, {name: string, lngLat: number[]}>} geo
 * @property {Object.<string, {rank: number, isHome: boolean, isDestination: boolean, isVisible: boolean}>} defaults
 *
 * @typedef {Object} InitialEdgeData edge data returned by this function
 * @property {Object.<string, {name: string, lngLat: number[]}>} geo
 * @property {Object.<string, {isVisible: boolean}>} defaults
 *
 * @param {string} home
 * @param {ExternalCityData[]} cities
 * @returns {[InitialCityData, InitialEdgeData]}
 */
export function prepareInitialDataForMap(home, cities) {
  const preparedCities = { geo: {}, defaults: {} };
  const preparedEdges = { geo: {}, defaults: {} };

  for (let city of cities) {
    const isHome = city.id === home;

    preparedCities.geo[city.id] = {
      name: city.name,
      lngLat: city.lngLat,
    };

    preparedCities.defaults[city.id] = {
      // the higher the rank, the likelier that the city is shown
      // currently we only use rank 2 (for destinations) and rank 1 (for everything else)
      rank: city.isDestination ? 2 : 1,
      isHome: isHome,
      isDestination: city.isDestination ?? false,
      isVisible: (isHome || city.isDestination) ?? false,
    };
  }

  // todo this creates an edge for every combination of cities, which might be too much for a large network
  // previously we had all connection data available from the start, so could create only those edges that actually
  // exist. that is no longer possible now because we are pulling in connection data on demand. simply creating
  // all the combinations is the easiest way to keep working with the way things are currently set up for the map.
  // alternative would be to consider to update the edge source layer everytime we want to draw new edges
  // but that in turn might be too slow? -> investigate
  for (let city1 of cities) {
    for (let city2 of cities) {
      if (city1.id === city2.id) continue;
      if (city1.id > city2.id) continue; // only keep alphabetically ordered pairs

      const edgeId = identifiers.edge({
        from: { city: city1 },
        to: { city: city2 },
      });

      preparedEdges.geo[edgeId] = {
        startLngLat: preparedCities.geo[city1.id].lngLat,
        endLngLat: preparedCities.geo[city2.id].lngLat,
      };
      preparedEdges.defaults[edgeId] = { isVisible: false };
    }
  }

  return [preparedCities, preparedEdges];
}

/**
 * @typedef {Object} CityUpdate
 * @property {boolean} isVisible
 * @property {boolean} isStop
 * @property {boolean} isTransfer
 * @property {string} circleColor
 *
 * @returns CityUpdate
 */
function defaultCityData() {
  return {
    // todo why do we need both isVisible and isStop? why not isActive?
    isVisible: true,
    isStop: true,
    // the following will be updated only for cities in the active itinerary
    circleColor: null, // todo is that an issue to set it to null?
    isTransfer: false,
  };
}

/**
 * @typedef {Object} EdgeUpdate
 * @property {boolean} isVisible
 * @property {string[]} legs
 * @property {string[]} itineraries
 * @property {boolean} isActive
 * @property {string} color
 * @property {string | null} activeLeg
 * @property {string | null} activeItinerary
 *
 * @returns {EdgeUpdate}
 */
function defaultEdgeData() {
  return {
    isVisible: true,
    // all legs and itineraries in which this leg is used
    legs: [],
    itineraries: [],
    // the following will be updated only for edges in the active itinerary
    isActive: false,
    color: null,
    activeLeg: null,
    activeItinerary: null,
  };
}

/**
 * @typedef {Object} ItinerarySummary
 * @property {string} from
 * @property {string} to
 * @property {string[]} via
 * @property {number} numTransfer
 * @property {string} travelTime
 *
 * @param {Itinerary} itinerary
 * @returns {ItinerarySummary}
 */
function itinerarySummary(itinerary) {
  return {
    from: itinerary.from.city.name,
    to: itinerary.to.city.name,
    via: itinerary.vias.map((v) => v.city.name),
    numTransfer: itinerary.vias.length,
    travelTime: itinerary.to.arrival
      .diff(itinerary.from.departure)
      .as("minutes"),
  };
}

/**
 *
 * @param {Itinerary} activeItinerary
 * @param {Itinerary[]} otherItineraries
 * @returns {{cities: Object<string,CityUpdate>,
 *            edges: Object<string,EdgeUpdate>,
 *            itineraries: Object.<string, ItinerarySummary>}}
 */
export function prepareDataForMap(activeItinerary, otherItineraries) {
  const result = {
    cities: {},
    edges: {},
    itineraries: {},
  };

  let allItineraries = otherItineraries;
  if (activeItinerary)
    allItineraries = allItineraries.concat([activeItinerary]);

  // initialize data for all itineraries
  for (let itinerary of allItineraries) {
    // itinerary summary
    const itineraryId = identifiers.itinerary(itinerary);
    result.itineraries[itineraryId] = itinerarySummary(itinerary);

    for (let connection of itinerary.connections) {
      const legId = identifiers.leg(connection);

      // city data
      for (let stop of connection.stops) {
        const cityId = identifiers.city(stop);
        if (!result.cities[cityId]) result.cities[cityId] = defaultCityData();
      }

      // edge data
      for (let edge of connection.edges) {
        const edgeId = identifiers.edge(edge);
        if (!result.edges[edgeId]) result.edges[edgeId] = defaultEdgeData();

        result.edges[edgeId].legs.push(legId);
        result.edges[edgeId].itineraries.push(itineraryId);
      }
    }
  }

  // additional info for active itinerary
  if (activeItinerary) {
    const itineraryId = identifiers.itinerary(activeItinerary);

    activeItinerary.connections.forEach((connection, idx) => {
      const legId = identifiers.leg(connection);
      const color = `rgb(${getColor(idx)})`;

      // all active stops get a color
      for (let stop of connection.stops) {
        const cityId = identifiers.city(stop);
        result.cities[cityId].circleColor = color;
      }

      // if there is more than one connection,
      // then all from stops except for the first connection are transfer stops
      if (activeItinerary.connections.length > 1 && idx > 0) {
        const cityId = identifiers.city(connection.from);
        result.cities[cityId].isTransfer = true;
      }

      // all active edges get a color and references to the active itinerary
      for (let edge of connection.edges) {
        const edgeId = identifiers.edge(edge);
        result.edges[edgeId].isActive = true;
        result.edges[edgeId].color = color;
        result.edges[edgeId].activeLeg = legId;
        result.edges[edgeId].activeItinerary = itineraryId;
      }
    });
  }

  return result;
}
