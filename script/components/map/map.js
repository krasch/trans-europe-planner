import { mapLayers } from "style/planner/components/map/layers.js";

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
  #connectionIdToEdges = {};

  #callbacks = { itinerarySelected: (itineraryId) => {} };

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
        this.#initEventHandlers();

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

  #initEventHandlers() {
    let previousEdge = null;
    let previousCity = null;

    this.#map.on("mousemove", "edges-interact", (e) => {
      const edge = e.features[0];

      // still hovering over the same edge, nothing changed, nothing to be done
      if (previousEdge === edge) return;

      // no longer hover over this edge
      if (previousEdge)
        this.setHoverConnection(previousEdge.state.connectionId, false);

      // have just started hovering over this edge
      previousEdge = edge;
      this.setHoverConnection(edge.state.connectionId, true);

      // todo callback
    });

    this.#map.on("mouseleave", "edges-interact", (e) => {
      if (!previousEdge) return;

      // no longer hover over this edge
      this.setHoverConnection(previousEdge.state.connectionId, false);
      previousEdge = null;
    });

    this.#map.on("click", "edges-interact", (e) => {
      const edge = e.features[0];
      if (!edge.state.isActive)
        this.#callbacks.itinerarySelected(edge.state.itineraryId);
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

    this.#updateRefs(data);

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
  #updateRefs(data) {
    // todo clean up
    this.#connectionIdToEdges = {};
    for (let edgeId in data.edges) {
      const connectionId = data.edges[edgeId].featureState.connectionId;
      if (!this.#connectionIdToEdges[connectionId])
        this.#connectionIdToEdges[connectionId] = [];
      this.#connectionIdToEdges[connectionId].push(edgeId);
    }
  }

  /**
   * @param {string} connectionId
   * @param {boolean} state
   */
  setHoverConnection(connectionId, state) {
    const edges = this.#connectionIdToEdges[connectionId];
    this.#setHoverStateForAll("edges", edges, state);
  }

  /**
   * @param {string} sourceName
   * @param {string[]} ids
   * @param {boolean} state
   */
  #setHoverStateForAll(sourceName, ids, state) {
    for (let id of ids) {
      const featureState = this.#previousData[sourceName][id];
      featureState.isHover = state;
      this.#map.setFeatureState({ source: sourceName, id: id }, featureState);
    }
  }
}
