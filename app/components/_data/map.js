import { GREY, getColor } from "app/components/assets.js";
import { Itinerary } from "app/types/itinerary.js";
import { StopTime } from "app/types/stop.js";

/**
 * @param {StopTime} stopTime1
 * @param {StopTime} stopTime2
 */
function orderByStopId(stopTime1, stopTime2) {
  if (stopTime1.stop.id < stopTime2.stop.id) return [stopTime1, stopTime2];
  else return [stopTime2, stopTime1];
}

/**
 * @param {StopTime} stopTime
 * @returns {object}
 */
function defaultStopData(stopTime) {
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
        coordinates: stopTime.stop.lnglat,
      },
      properties: {
        id: stopTime.stop.id,
        name: stopTime.stop.name,
      },
    },
  };
}

/**
 * @param {StopTime} from
 * @param {StopTime} to
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
      itineraryGeoRoute: null,
    },
    geoJSON: {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [from.stop.lnglat, to.stop.lnglat],
      },
      properties: { id: edgeId },
    },
  };
}

/**
 * @param {Itinerary} itinerary
 * @returns {[StopTime[], Number[]]}  // the second item maps {stopIdx: connectionIdx}
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
      result.stops[stop.stop.id] = defaultStopData(stop);

      // mark special stops
      result.stops[stop.stop.id].featureState.isStart = s === 0;
      result.stops[stop.stop.id].featureState.isDestination =
        s === stops.length - 1;
      result.stops[stop.stop.id].featureState.isTransfer =
        s > 0 && stopToConnection[s] !== stopToConnection[s - 1];

      // additional info for stops in active itinerary
      if (itinerary === activeItinerary) {
        result.stops[stop.stop.id].featureState.isActive = true;
        result.stops[stop.stop.id].featureState.color = `rgb(${color})`;
      }

      // if this is the first stop in this itinerary, there is no edge
      if (s === 0) continue;

      // these are two subsequent stops in this itinerary
      // if this a transfer, then from might be to
      const previous = stops[s - 1];
      if (stop.stop.id === previous.stop.id) continue;

      // don't want duplicate edges -> order by alphabet
      let [edgeStart, edgeEnd] = orderByStopId(previous, stop);
      if (edgeStart.stop.id > edgeEnd.stop.id)
        [edgeStart, edgeEnd] = [stop, previous];

      let edgeId = `${edgeStart.stop.id}->${edgeEnd.stop.id}`;
      result.edges[edgeId] = defaultEdgeData(edgeStart, edgeEnd, edgeId);

      // need this in map event handlers
      result.edges[edgeId].featureState.connectionId = connection.id.toString();
      result.edges[edgeId].featureState.itineraryGeoRoute = itinerary.geoRoute;

      // additional info for edges in active itinerary
      if (itinerary === activeItinerary) {
        result.edges[edgeId].featureState.isActive = true;
        result.edges[edgeId].featureState.color = `rgb(${color})`;
      }
    }
  }
  return result;
}
