import { mapLayers } from "style/planner/components/map/layers.js";

import "external/maplibre-gl@5.15.0/maplibre-gl.js";

import { groupBy } from "script/util.js";

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
  #map;
  #mapReady;

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
   */
  constructor(containerId, center, zoom) {
    // @ts-expect-error TS2686
    this.#map = new maplibregl.Map({
      container: containerId,
      style: "style/planner/components/map/outdoors-modified.json",
      center: center,
      zoom: zoom,
      // we always start out with making the map non-interactive
      interactive: false,
      // will set this manually later
      attributionControl: false,
    });

    // visual indication that map is non-interactive
    this.#map._container.style.opacity = "0.4";

    // after map has loaded, do a bunch of initialisation stuff
    this.#mapReady = new Promise((fulfilled, rejected) => {
      this.#map.on("load", async () => {
        // otherwise on mobile map does not cover full landing page
        this.#map.resize();

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
    await this.#mapReady;

    this.#updateSourceData("stops", data.stops);
    this.#updateSourceData("edges", data.edges);

    this.#updateFeatureState("stops", data.stops);
    this.#updateFeatureState("edges", data.edges);

    this.#updateLookup(data);

    this.#previousData = data;
  }

  /**
   * @param {string} connectionId
   * @param {boolean} isHover
   */
  setConnectionHover(connectionId, isHover) {
    const edges = this.#lookup.connectionIdToEdges[connectionId];
    this.#setHoverStateForAll("edges", edges, isHover);
  }

  /**
   * @param {string} itineraryId
   * @param {boolean} isHover
   */
  setItineraryHover(itineraryId, isHover) {
    const edges = this.#lookup.itineraryIdToEdges[itineraryId];
    this.#setHoverStateForAll("edges", edges, isHover);
  }

  /**
   * @param {string} stopId
   * @param {boolean} isHover
   */
  setStopHover(stopId, isHover) {
    this.#setHoverStateForAll("stops", [stopId], isHover);
  }

  setMapInteractive() {
    this.#mapReady.then(() => {
      // add attribution control
      // @ts-expect-error TS2686
      const attribution = new maplibregl.AttributionControl();
      this.#map.addControl(attribution);

      // show +/- zoom buttons
      this.#map.addControl(
        // @ts-expect-error TS2686
        new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        "bottom-right",
      );

      this.#map.getCanvas().style.cursor = "default";

      this.#map.boxZoom.enable();
      this.#map.scrollZoom.enable();
      this.#map.dragPan.enable();
      this.#map.keyboard.enable();
      this.#map.doubleClickZoom.enable();
      this.#map.touchZoomRotate.enable();

      // disable map rotation
      // this.#map.dragRotate.enable(); // simply never enable this one
      this.#map.touchZoomRotate.disableRotation();
      this.#map.keyboard.disableRotation();

      this.#map._container.style.opacity = "1.0";
    });
  }

  async #setupLayers() {
    // empty stops source
    this.#map.addSource("stops", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // we are using {"features": {"id": }} as id field
      // there is also an outer "id" field but that one only allows numeric ids
      promoteId: "id",
    });

    // empty edges source
    this.#map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // see above
      promoteId: "id",
    });

    for (let layer of mapLayers) this.#map.addLayer(layer);
  }

  #initStopEventHandlers() {
    let previousStop = null;

    this.#map.on("mousemove", "stops-interact", (e) => {
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

    this.#map.on("mouseleave", "stops-interact", (e) => {
      if (!previousStop) return;

      // have just stopped hovering over previous stop
      this.setStopHover(previousStop.id, false);
      this.#callbacks.stopHover(previousStop.id, false);

      previousStop = null;
    });

    this.#map.on("click", "stops-interact", (e) => {
      const stop = e.features[0];
      this.#callbacks.stopClicked(stop.id);
    });
  }

  #initEdgeEventHandlers() {
    let previousEdge = null;
    this.#map.on("mousemove", "edges-interact", (e) => {
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

    this.#map.on("mouseleave", "edges-interact", (e) => {
      if (!previousEdge) return;

      // no longer hovering over previous edge
      this.setItineraryHover(previousEdge.state.itineraryId, false);
      this.#callbacks.connectionHover(previousEdge.state.connectionId, false);
      this.#callbacks.itineraryHover(previousEdge.state.itineraryId, false);

      previousEdge = null;
    });

    this.#map.on("click", "edges-interact", (e) => {
      const edge = e.features[0];
      this.#callbacks.connectionClicked(edge.state.connectionId);
      this.#callbacks.itineraryClicked(edge.state.itineraryId);
    });
  }

  /**
   * @param {string} sourceName
   * @param {object} data todo
   */
  #updateSourceData(sourceName, data) {
    // completely replace the source, todo instead just update
    // todo should be async?
    const geo = asGeojsonFeatureCollection(
      Object.values(data).map((s) => s.geoJSON),
    );
    this.#map.getSource(sourceName).setData(geo);
  }

  /**
   * @param {string} sourceName
   * @param {object} data todo
   */
  #updateFeatureState(sourceName, data) {
    // completely replace the feature state, todo instead just update
    // todo should be async?
    for (let id in data) {
      this.#map.setFeatureState(
        { source: sourceName, id: id },
        data[id].featureState,
      );
    }
  }

  /**
   * @param {object} data todo
   */
  #updateLookup(data) {
    this.#lookup.connectionIdToEdges = groupBy(
      Object.keys(data.edges),
      (edgeId) => data.edges[edgeId].featureState.connectionId,
    );
    this.#lookup.itineraryIdToEdges = groupBy(
      Object.keys(data.edges),
      (edgeId) => data.edges[edgeId].featureState.itineraryId,
    );
  }

  /**
   * @param {string} sourceName
   * @param {string[]} ids
   * @param {boolean} isHover
   */
  #setHoverStateForAll(sourceName, ids, isHover) {
    for (let id of ids) {
      const featureState = this.#previousData[sourceName][id];
      featureState.isHover = isHover;
      this.#map.setFeatureState({ source: sourceName, id: id }, featureState);
    }
  }
}
