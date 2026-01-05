import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

import { GREY, getColor } from "./_common.js";

/**
 * @param {string} start
 * @param {string} end
 */
function toAlphabeticEdgeString(start, end) {
  if (start < end) return `${start}->${end}`;
  else return `${end}->${start}`;
}

/**
 * @param {Stop} stop
 * @returns {object}
 */
function defaultStopData(stop) {
  return {
    featureState: {
      isActive: false,
      isStart: false,
      isDestination: false,
      isTransfer: false,
      color: GREY,
    },
    geoJSON: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [stop.longitude, stop.latitude],
      },
      properties: {
        id: stop.stopId,
        name: stop.stopName,
      },
    },
  };
}

/**
 * @param {Stop} from
 * @param {Stop} to
 * @param {String} edgeId
 * @returns {object}
 */
function defaultEdgeData(from, to, edgeId) {
  return {
    featureState: {
      isActive: false,
      color: GREY,
      // this is in here because it gives us easy access to this info in event handler
      connectionId: null,
      itineraryId: null,
    },
    geoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [from.lnglat, to.lnglat],
      },
      properties: { id: edgeId },
    },
  };
}

/**
 * @param {Itinerary} itinerary
 * @returns {[Stop[], Number[]]}  // the second item maps {stopIdx: connectionIdx}
 */
function flatStopList(itinerary) {
  const flatStopList = [];
  const stopIdxToConnectionIdx = [];

  itinerary.connections.forEach((connection, connectionIdx) => {
    connection.stops.forEach((stop, stopIdx) => {
      flatStopList.push(stop);
      stopIdxToConnectionIdx.push(connectionIdx);
    });
  });

  return [flatStopList, stopIdxToConnectionIdx];
}

/**
 *
 * @param {Itinerary} activeItinerary
 * @param {Itinerary[]} otherItineraries
 */
export function prepareDataForMap(activeItinerary, otherItineraries) {
  const result = {
    stops: {},
    edges: {},
  };

  // important to put active itinerary last to not accidentally overwrite
  // active itinerary feature state information when looping through itineraries
  const allItineraries = otherItineraries.concat([activeItinerary]);

  for (let itinerary of allItineraries) {
    const [stops, stopToConnection] = flatStopList(itinerary);

    for (let s = 0; s < stops.length; s++) {
      const stop = stops[s];
      const color = getColor(stopToConnection[s]);
      const connection = itinerary.connections[stopToConnection[s]];

      // init stop information
      result.stops[stop.stopId] = defaultStopData(stop);

      // mark special stops
      result.stops[stop.stopId].featureState.isStart = s === 0;
      result.stops[stop.stopId].featureState.isDestination =
        s === stops.length - 1;
      result.stops[stop.stopId].featureState.isTransfer =
        s > 0 && stopToConnection[s] !== stopToConnection[s - 1];

      // additional info for stops in active itinerary
      if (itinerary === activeItinerary) {
        result.stops[stop.stopId].featureState.isActive = true;
        result.stops[stop.stopId].featureState.color = `rgb(${color})`;
      }

      // if this is the first stop in this itinerary, there is no edge
      if (s === 0) continue;

      // we must draw a line between these stops -> they form an edge
      // todo can it be that from === to?
      const [from, to] = [stops[s - 1], stop];
      const edgeId = toAlphabeticEdgeString(from.stopId, to.stopId);

      // init edge information
      result.edges[edgeId] = defaultEdgeData(from, to, edgeId);

      // need this in map event handlers
      result.edges[edgeId].featureState.connectionId = connection.id;
      result.edges[edgeId].featureState.itineraryId = itinerary.id;

      // additional info for edges in active itinerary
      if (itinerary === activeItinerary) {
        result.edges[edgeId].featureState.isActive = true;
        result.edges[edgeId].featureState.color = `rgb(${color})`;
      }
    }
  }
  return result;
}
