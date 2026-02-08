import { mapLayers } from "style/planner/components/map/layers.js";

// @ts-nocheck
import "external/maplibre-gl@5.15.0/maplibre-gl.js";

import { calculateDiff, groupBy } from "../util.js";

const STYLE = "style/planner/components/map/outdoors-modified.json";

/**
 * @param {any[]} features
 */
function asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

export class MapWrapper {
  // these should ideally be private, but need them for testing
  // todo perhaps pass in loaded map as variables instead?
  map;
  mapReady;

  #previousData = { stops: {}, edges: {} };
  #lookup = { connectionIdToEdges: {}, itineraryIdToEdges: {} };

  #callbacks = {
    stopHover: (stopId, isHover) => {},
    stopClicked: (stopId) => {},
    connectionHover: (connectionId, isHover) => {},
    connectionClicked: (connectionId) => {},
    itineraryHover: (itineraryId, isHover) => {},
    itineraryClicked: (itineraryId) => {},
  };

  /**
   * @param {string} containerId
   * @param {number[]} center
   * @param {number} zoom
   * @param {string} style
   */
  constructor(containerId, center, zoom, style = STYLE) {
    // @ts-expect-error TS2304
    this.map = new maplibregl.Map({
      container: containerId,
      style: style,
      center: center,
      zoom: zoom,
      // we always start out with making the map non-interactive
      interactive: false,
      // will set this manually later
      attributionControl: false,
    });

    // visual indication that map is non-interactive
    this.map._container.style.opacity = "0.4";

    // after map has loaded, do a bunch of initialisation stuff
    // mapReady is a public member for testability reasons
    this.mapReady = new Promise((fulfilled, rejected) => {
      this.map.on("load", async () => {
        // otherwise on mobile map does not cover full landing page
        this.map.resize();

        await this.#setupLayers();

        this.#initStopEventHandlers();
        this.#initEdgeEventHandlers();

        return fulfilled();
      });
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  /**
   * @param {object} data
   */
  async updateView(data) {
    await this.mapReady;

    await this.#updateSourceDataAndFeatureState("stops", data.stops);
    await this.#updateSourceDataAndFeatureState("edges", data.edges);

    // update mapping from connection id and itinerary id to edges
    this.#updateLookup(data.edges);

    this.#previousData = data;
  }

  /**
   * @param {string} connectionId
   * @param {boolean} isHover
   */
  setConnectionHover(connectionId, isHover) {
    if (!this.#lookup.connectionIdToEdges[connectionId]) return;
    const edgeIds = this.#lookup.connectionIdToEdges[connectionId];
    this.#setHoverStateForAll("edges", edgeIds, isHover);
  }

  /**
   * @param {string} itineraryId
   * @param {boolean} isHover
   */
  setItineraryHover(itineraryId, isHover) {
    if (!this.#lookup.itineraryIdToEdges[itineraryId]) return;
    const edgeIds = this.#lookup.itineraryIdToEdges[itineraryId];
    this.#setHoverStateForAll("edges", edgeIds, isHover);
  }

  /**
   * @param {string} stopId
   * @param {boolean} isHover
   */
  setStopHover(stopId, isHover) {
    this.#setHoverStateForAll("stops", [stopId], isHover);
  }

  setMapInteractive() {
    this.mapReady.then(() => {
      // add attribution control
      // @ts-expect-error TS2304
      const attribution = new maplibregl.AttributionControl();
      this.map.addControl(attribution);

      // show +/- zoom buttons
      this.map.addControl(
        // @ts-expect-error TS2304
        new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        "bottom-right",
      );

      this.map.getCanvas().style.cursor = "default";

      this.map.boxZoom.enable();
      this.map.scrollZoom.enable();
      this.map.dragPan.enable();
      this.map.keyboard.enable();
      this.map.doubleClickZoom.enable();
      this.map.touchZoomRotate.enable();

      // disable map rotation
      // this.#map.dragRotate.enable(); // simply never enable this one
      this.map.touchZoomRotate.disableRotation();
      this.map.keyboard.disableRotation();

      this.map._container.style.opacity = "1.0";
    });
  }

  async #setupLayers() {
    // empty stops source
    this.map.addSource("stops", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // we are using {"features": {"id": }} as id field
      // there is also an outer "id" field but that one only allows numeric ids
      promoteId: "id",
    });

    // empty edges source
    this.map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // see above
      promoteId: "id",
    });

    for (let layer of mapLayers) this.map.addLayer(layer);
  }

  #initStopEventHandlers() {
    let previousStop = null;

    this.map.on("mousemove", "stops-interact", (e) => {
      const stop = e.features[0];

      // still hovering over the same stop, nothing changed, nothing to be done
      if (previousStop && previousStop.id === stop.id) return;

      // let's say "stop" and "previousStop" are overlapping each other
      // i.e. we are hovering over both at the same time (but "stop" is nearer)
      // this means that no leave event for "previousStop" was fired
      // -> we need to un-highlight "previousStop" here, otherwise two stops
      //    would be highlighted at the same time
      if (previousStop) {
        this.setStopHover(previousStop.id, false);
        this.#callbacks.stopHover(previousStop.id, false);
      }

      // have just started hovering over this stop
      this.setStopHover(stop.id, true);
      this.#callbacks.stopHover(stop.id, true);

      previousStop = stop;
    });

    this.map.on("mouseleave", "stops-interact", (e) => {
      if (!previousStop) return;

      // have just stopped hovering over previous stop
      this.setStopHover(previousStop.id, false);
      this.#callbacks.stopHover(previousStop.id, false);

      previousStop = null;
    });

    this.map.on("click", "stops-interact", (e) => {
      const stop = e.features[0];
      this.#callbacks.stopClicked(stop.id);
    });
  }

  #initEdgeEventHandlers() {
    let previousEdge = null;
    this.map.on("mousemove", "edges-interact", (e) => {
      const edge = e.features[0];

      // still hovering over the same edge, nothing changed, nothing to be done
      if (previousEdge === edge) return;

      // see explanation in stop mousemove event handler
      if (previousEdge) {
        this.setItineraryHover(previousEdge.state.itineraryId, false);
        this.#callbacks.connectionHover(previousEdge.state.connectionId, false);
        this.#callbacks.itineraryHover(previousEdge.state.itineraryId, false);
      }

      // have just started hovering over this edge
      this.setItineraryHover(edge.state.itineraryId, true);
      this.#callbacks.connectionHover(edge.state.connectionId, true);
      this.#callbacks.itineraryHover(edge.state.itineraryId, true);

      previousEdge = edge;
    });

    this.map.on("mouseleave", "edges-interact", (e) => {
      if (!previousEdge) return;

      // no longer hovering over previous edge
      this.setItineraryHover(previousEdge.state.itineraryId, false);
      this.#callbacks.connectionHover(previousEdge.state.connectionId, false);
      this.#callbacks.itineraryHover(previousEdge.state.itineraryId, false);

      previousEdge = null;
    });

    this.map.on("click", "edges-interact", (e) => {
      const edge = e.features[0];
      this.#callbacks.connectionClicked(edge.state.connectionId);
      this.#callbacks.itineraryClicked(edge.state.itineraryId);
    });
  }

  /**
   * @param {string} sourceName
   * @param {object} data
   */
  async #updateSourceDataAndFeatureState(sourceName, data) {
    const diff = calculateDiff(
      Object.keys(this.#previousData[sourceName]),
      Object.keys(data),
    );

    // geo-items were added or remove -> let's update the whole source data
    if (diff.added || diff.removed) {
      const geo = asGeojsonFeatureCollection(
        Object.values(data).map((s) => s.geoJSON),
      );
      await this.map.getSource(sourceName).setData(geo);
    }

    // for new geo-items we can just take the full feature state dict
    for (let id of diff.added) {
      this.#setFeatureState(sourceName, id, data[id].featureState);
    }

    // for removed geo-items, we want to clear the current feature state
    for (let id of diff.removed) {
      this.#removeFeatureState(sourceName, id);
    }

    // for geo-items that were there previously, some feature values might have
    // changed/been removed -> to be safe, let's remove the full state and
    // then set it to the new values
    for (let id of diff.same) {
      this.#removeFeatureState(sourceName, id);
      this.#setFeatureState(sourceName, id, data[id].featureState);
    }
  }

  /**
   * @param {object} data
   */
  #updateLookup(data) {
    this.#lookup.connectionIdToEdges = groupBy(
      Object.keys(data),
      (edgeId) => data[edgeId].featureState.connectionId,
    );
    this.#lookup.itineraryIdToEdges = groupBy(
      Object.keys(data),
      (edgeId) => data[edgeId].featureState.itineraryId,
    );
  }

  /**
   * @param {string} sourceName
   * @param {string[]} ids
   * @param {boolean} isHover
   */
  #setHoverStateForAll(sourceName, ids, isHover) {
    for (let id of ids) {
      if (!this.#previousData[sourceName][id]) continue;

      const featureState = this.#previousData[sourceName][id].featureState;
      featureState.isHover = isHover;
      this.map.setFeatureState({ source: sourceName, id: id }, featureState);
    }
  }

  /**
   * @param {string} sourceName
   * @param {string} id
   * @param {object} stateDict
   */
  #setFeatureState(sourceName, id, stateDict) {
    this.map.setFeatureState({ source: sourceName, id: id }, stateDict);
  }

  /**
   * @param {string} sourceName
   * @param {string} id
   */
  #removeFeatureState(sourceName, id) {
    this.map.removeFeatureState({ source: sourceName, id: id });
  }
}
