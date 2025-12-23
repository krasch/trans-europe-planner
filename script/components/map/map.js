import { mapLayers } from "style/planner/components/map/layers.js";

import { Cities } from "./cities.js";
import { Edges } from "./edges.js";

function _cityToGeojson(data) {
  const [id, city] = data;

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: city.lngLat,
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: {
      id: id,
      name: city.name,
    },
  };
}

function _edgeToGeojson(data) {
  const [id, edge] = data;

  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [edge.startLngLat, edge.endLngLat],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { id: id },
  };
}

function _asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

export class MapWrapper {
  #attribution;
  #map;
  #mapReady;

  #callbacks = {
    /**
     * @param {string} journeyId
     */
    selectJourney: (journeyId) => {},
    showCityRoutes: (cityId) => {},
    showCalendar: (journeyId) => {},
  };

  #journeys;
  #mapping;

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

    this.#mapReady = new Promise((fulfilled, rejected) => {
      this.#map.on("load", async () => {
        await this.#configureMap();
        this.#setupLayers();

        // now map is interactive, show with full opacity
        this.#map._container.style.opacity = 1.0;
      });
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  async #configureMap() {
    const image = await this.#map.loadImage("/images/markers/circle.sdf.png");
    this.#map.addImage("circle", image.data, { sdf: true });

    // configure map details
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

  #setupLayers() {
    // add cities and legs source layers
    /*this.#map.addSource("cities", {
      type: "geojson",
      data: _asGeojsonFeatureCollection([]),
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.#map.addSource("edges", {
      type: "geojson",
      data: _asGeojsonFeatureCollection([]),
      promoteId: "id", // otherwise can not use non-numeric ids
    });

    // add all layers
    for (let layer of mapLayers) this.#map.addLayer(layer);

    this.cities = new Cities(this.#map);
    this.edges = new Edges(this.#map);

    this.cities.on("menuClick", (id, entry) => {
      if (entry === "showRoutes") this.#callbacks["showCityRoutes"](id);
    });

    this.edges.on("mouseOver", (id, lngLat) => {
      const journey = this.edges.getState(id, "journey");
      this.setJourneyHoverState(journey, true);
    });

    this.edges.on("mouseLeave", (id, lngLat) => {
      const journey = this.edges.getState(id, "journey");
      this.setJourneyHoverState(journey, false);
    });

    this.edges.on("click", (id, lngLat) => {
      const active = this.edges.getState(id, "isActive");
      const journeyId = this.edges.getState(id, "journey");

      // first click = make active
      if (!active) {
        this.#callbacks["selectJourney"](journeyId);
        return;
      }

      // second click = show menu
      //this.edges.showJourneyMenu(journeyId, this.#journeys[journeyId], lngLat);
    });

    this.edges.on("menuClick", (journeyId, entry) => {
      if (entry === "showCalendar") {
        this.#callbacks["showCalendar"](journeyId);
      }
    });*/
  }

  /**
   * @typedef {import("script/data/components/map.js").CityUpdate} CityUpdate
   * @typedef {import("script/data/components/map.js").EdgeUpdate} EdgeUpdate
   * @typedef {import("script/data/components/map.js").ItinerarySummary} ItinerarySummary
   *
   * @param {object} data
   * @param {Object<string,CityUpdate>} data.cities
   * @param {Object<string,EdgeUpdate>} data.edges
   * @param {Object<string, ItinerarySummary>} data.itineraries
   */
  async updateView(data) {
    await this.#mapReady;
    // todo clean this up
    /*this.#mapping = { edges: {} };
    for (let edgeId in data.edges) {
      this.#mapping.edges[edgeId] = {
        legs: data.edges[edgeId].legs,
        itineraries: data.edges[edgeId].itineraries,
      };
      delete data.edges[edgeId].legs;
      delete data.edges[edgeId].itineraries;
    }

    this.cities.update(data.cities);
    this.edges.update(data.edges);
    this.#journeys = data.itineraries;*/
  }

  setLegHoverState(leg, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].legs.includes(leg))
        this.edges.setHover(id, state);
    }
  }

  setJourneyHoverState(journey, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].itineraries.includes(journey))
        this.edges.setHover(id, state);
    }
  }
}
