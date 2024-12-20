function cityToGeojson(data) {
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

function edgeToGeojson(data) {
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

function asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

// this class abstracts away following issues
// 1. We want to react on multiple layers (e.g. all city layers) with the same event handlers
// 2. The maplibre mouseLeave event does not contain the feature that was left -> need to keep state
// 3. We want to prefer city events to edge events
class MouseEventHelper {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
  };

  constructor(map, layerNames, priorityLayers = null) {
    let previousFeatureId = null;

    const getFirstVisible = (features) => {
      const visible = features.filter((f) => f.state.isVisible);
      if (visible.length > 0) return visible[0].id;
      return null;
    };

    const hasHigherPriorityFeatures = (point) => {
      if (!priorityLayers) return false;

      const features = map.queryRenderedFeatures(point, {
        layers: priorityLayers,
      });

      return getFirstVisible(features) !== null;
    };

    const mouseMove = (layer, e) => {
      const newFeatureId = getFirstVisible(e.features);
      if (!newFeatureId) return;

      if (hasHigherPriorityFeatures(e.point)) {
        if (previousFeatureId !== null)
          this.#callbacks["mouseLeave"](previousFeatureId, e.lngLat);

        previousFeatureId = null;
        return;
      }

      if (previousFeatureId === null || previousFeatureId !== newFeatureId) {
        if (previousFeatureId !== null)
          this.#callbacks["mouseLeave"](previousFeatureId, e.lngLat);
        this.#callbacks["mouseOver"](newFeatureId, e.lngLat);
        previousFeatureId = newFeatureId;
      }
    };

    const mouseLeave = (layer, e) => {
      if (previousFeatureId !== null)
        this.#callbacks["mouseLeave"](previousFeatureId, e.lngLat);
      previousFeatureId = null;
    };

    const click = (layer, e) => {
      if (previousFeatureId !== null)
        this.#callbacks["click"](previousFeatureId, e.lngLat);
    };

    for (let layer of layerNames) {
      map.on("mousemove", layer, (e) => mouseMove(layer, e));
      map.on("mouseleave", layer, (e) => mouseLeave(layer, e));
      map.on("click", layer, (e) => click(layer, e));
    }
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }
}

class MapWrapper {
  #callbacks = {
    selectJourney: () => {},
    showCityRoutes: () => {},
    hideCityRoutes: () => {},
  };

  #journeys;
  #mapping;

  constructor(containerId, center, zoom) {
    this.map = new maplibregl.Map({
      container: containerId,
      style: "style/map/outdoors-modified.json",
      center: center,
      zoom: zoom,
    });
  }

  async load(cities, legs) {
    return new Promise((fulfilled, rejected) => {
      this.map.on("load", async () => {
        try {
          const image = await this.map.loadImage(
            "images/markers/circle.sdf.png",
          );
          this.map.addImage("circle", image.data, { sdf: true });

          this.init(cities, legs);
          fulfilled();
        } catch (error) {
          rejected(error);
        }
      });
    });
  }

  init(data) {
    this.map.getCanvas().style.cursor = "default";

    const [cities, edges] = data;

    // add cities and legs sources
    this.map.addSource("cities", {
      type: "geojson",
      data: asGeojsonFeatureCollection(
        Object.entries(cities.geo).map(cityToGeojson),
      ),
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection(
        Object.entries(edges.geo).map(edgeToGeojson),
      ),
      promoteId: "id", // otherwise can not use non-numeric ids
    });

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    this.cities = new Cities(this.map, cities.geo, cities.defaults);
    this.edges = new Edges(this.map, edges.geo, edges.defaults);

    this.cities.on("menuClick", (id, name, entry) => {
      if (entry === "showRoutes") this.#callbacks["showCityRoutes"](name);
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
      const journey = this.edges.getState(id, "journey");
      this.edges.showEdgeMenu(journey, this.#journeys[journey], lngLat);

      const active = this.edges.getState(id, "active");
      if (!active) this.#callbacks["selectJourney"](journey);
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {
    const [cities, edges, journeys] = data;

    this.cities.update(cities);
    this.edges.update(edges.state);

    this.#journeys = journeys;
    this.#mapping = {
      edges: edges.mapping,
    };
  }

  setLegHoverState(leg, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].legs.includes(leg))
        this.edges.setHover(id, state);
    }
  }

  setJourneyHoverState(journey, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].journeys.includes(journey))
        this.edges.setHover(id, state);
    }
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
}
