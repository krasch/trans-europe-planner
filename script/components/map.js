import { mapLayers } from "style/planner/components/map/layers.js";

import { groupBy } from "script/util.js";

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
    stopHoverOn: (stopId) => {},
    stopHoverOff: (stopId) => {},
    stopClicked: (stopId) => {},
    connectionHoverOn: (connectionId) => {},
    connectionHoverOff: (connectionId) => {},
    // connectionClicked: (connectionId) => {},
    itineraryHoverOn: (itineraryId) => {},
    itineraryHoverOff: (itineraryId) => {},
    itineraryClicked: (itineraryId) => {},
  };

  /**
   * @param {string} containerId
   * @param {number[]} center
   * @param {number} zoom
   */
  constructor(containerId, center, zoom) {
    // @ts-expect-error TS2304 (todo not doing module import for maplibre)
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
    this.#map._container.style.opacity = 0.4;

    // after map has loaded, do a bunch of initialisation stuff
    this.#mapReady = new Promise((fulfilled, rejected) => {
      this.#map.on("load", async () => {
        await this.#configureMap();
        await this.#setupLayers();

        this.#initStopEventHandlers();
        this.#initEdgeEventHandlers();

        // now map is ready&interactive, show with full opacity
        this.#map._container.style.opacity = 1.0;
        return fulfilled();
      });
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  async #configureMap() {
    const image = await this.#map.loadImage("/images/markers/circle.sdf.png");
    this.#map.addImage("circle", image.data, { sdf: true });

    this.#map.getCanvas().style.cursor = "default";

    // add attribution control
    // @ts-expect-error TS2304 (todo not doing module import for maplibre)
    const attribution = new maplibregl.AttributionControl();
    this.#map.addControl(attribution);

    // show +/- zoom buttons
    this.#map.addControl(
      // @ts-expect-error TS2304 (todo not doing module import for maplibre)
      new maplibregl.NavigationControl({
        showCompass: false,
        showZoom: true,
      }),
    );

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
  }

  async #setupLayers() {
    // empty stops source
    await this.#map.addSource("stops", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // we are using {"features": {"id": }} as id field
      // there is also an outer "id" field but that one only allows numeric ids
      promoteId: "id",
    });

    // empty edges source
    await this.#map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection([]),
      // see above
      promoteId: "id",
    });

    for (let layer of mapLayers) await this.#map.addLayer(layer);
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
        this.setHoverStop(previousStop.id, false);
        this.#callbacks.stopHoverOff(previousStop.id);
      }

      // have just started hovering over this stop
      this.setHoverStop(stop.id, true);
      this.#callbacks.stopHoverOn(stop.id);

      previousStop = stop;
    });

    this.#map.on("mouseleave", "stops-interact", (e) => {
      if (!previousStop) return;

      // have just stopped hovering over previous stop
      this.setHoverStop(previousStop.id, false);
      this.#callbacks.stopHoverOff(previousStop.id);

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
        this.setHoverItinerary(previousEdge.state.itineraryId, false);
        this.#callbacks.itineraryHoverOff(previousEdge.state.itineraryId);
      }

      // have just started hovering over this edge
      this.setHoverItinerary(edge.state.itineraryId, true);
      this.#callbacks.itineraryHoverOn(edge.state.itineraryId);

      previousEdge = edge;
    });

    this.#map.on("mouseleave", "edges-interact", (e) => {
      if (!previousEdge) return;

      // no longer hovering over previous edge
      this.setHoverItinerary(previousEdge.state.itineraryId, false);
      this.#callbacks.itineraryHoverOff(previousEdge.state.itineraryId);

      previousEdge = null;
    });

    this.#map.on("click", "edges-interact", (e) => {
      const edge = e.features[0];
      this.#callbacks.itineraryClicked(edge.state.itineraryId);
    });
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
   * @param {string} connectionId
   * @param {boolean} isHover
   */
  setHoverConnection(connectionId, isHover) {
    const edges = this.#lookup.connectionIdToEdges[connectionId];
    this.#setHoverStateForAll("edges", edges, isHover);
  }

  /**
   * @param {string} itineraryId
   * @param {boolean} isHover
   */
  setHoverItinerary(itineraryId, isHover) {
    const edges = this.#lookup.itineraryIdToEdges[itineraryId];
    this.#setHoverStateForAll("edges", edges, isHover);
  }

  /**
   * @param {string} stopId
   * @param {boolean} isHover
   */
  setHoverStop(stopId, isHover) {
    this.#setHoverStateForAll("stops", [stopId], isHover);
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
