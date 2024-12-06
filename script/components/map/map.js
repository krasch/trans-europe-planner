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
// 3. Maplibre does not attach the feature state to the event
class MouseEventHelper {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
  };

  constructor(map, layerNames, attachFeatureState = false) {
    let currentFeature = null;

    const enrichEvent = (layer, e) => {
      e.feature = currentFeature;
      e.layer = layer;

      if (attachFeatureState) {
        e.featureState = map.getFeatureState({
          source: e.feature.source,
          id: e.feature.id,
        });
      }
    };

    const mouseOver = (layer, e) => {
      if (e.features.length < 1) return;
      currentFeature = e.features.at(-1); // todo currently only looking at last event

      enrichEvent(layer, e);
      this.#callbacks["mouseOver"](e);
    };

    const mouseLeave = (layer, e) => {
      if (currentFeature) {
        enrichEvent(layer, e);
        this.#callbacks["mouseLeave"](e);

        currentFeature = null;
      }
    };

    const click = (layer, e) => {
      enrichEvent(layer, e);
      this.#callbacks["click"](e);
    };

    for (let layer of layerNames) {
      map.on("mouseover", layer, (e) => mouseOver(layer, e));
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

  #states;
  #objects;
  #observedKeys;

  constructor(containerId, center, zoom) {
    this.map = new maplibregl.Map({
      container: containerId,
      style: "style/outdoors-modified.json",
      center: center,
      zoom: zoom,
    });
  }

  async load(cities, legs) {
    return new Promise((fulfilled, rejected) => {
      this.map.on("load", async () => {
        try {
          const image = await this.map.loadImage("images/circle.sdf.png");
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

    // this will keep track of states
    this.#states = {
      cities: new StateManager(cities.defaults),
      edges: new StateManager(edges.defaults),
    };

    // all the bits and pieces shown on the map
    // all the things below must have an update() method
    this.#objects = {
      // cities
      cityMarkers: new CityMarkerCollection(cities.geo),
      cityMenus: new CityMenuCollection(cities.geo),
      citySourceData: new MapSourceDataUpdater("cities"),
      cityFeatureState: new FeatureStateUpdater("cities"),
      // edges
      edgeFeatureState: new FeatureStateUpdater("edges"),
    };

    // which keys of the state do the map objects listen to
    // must have one entry for every entry in this.#mapObjects
    // only updates concerning these keys will be sent to the update() method
    this.#observedKeys = {
      // cities
      cityMarkers: ["markerIcon", "markerSize", "markerColor"],
      cityMenus: ["menuDestination"],
      citySourceData: ["rank"], // slow to update
      cityFeatureState: ["circleVisible", "circleColor"],
      // edges
      edgeFeatureState: ["visible", "active", "color", "leg", "journey"],
    };

    // apply initial state (setToDefaults generates the necessary diffs)
    this.#updateCities(this.#states.cities.setToDefaults());
    this.#updateEdges(this.#states.edges.setToDefaults());

    // initialise mouse event helper for cities and edge layers
    const cityLayers = ["city-name", "city-circle"];
    const layerMouseEvents = {
      cities: new MouseEventHelper(this.map, cityLayers, true),
      edges: new MouseEventHelper(this.map, ["edges-interact"], true),
    };

    // this will be shown when user hovers over a journey
    const journeySummaryPopup = new PopupHelper(
      this.map,
      (e) => e.featureState.journey,
      (e) => e.featureState.journeyTravelTime,
    );

    // when clicking on city marker popup should show
    this.#objects.cityMarkers.setPopups(this.#objects.cityMenus);

    // set up mouse events for interacting with cities
    layerMouseEvents.cities.on("mouseOver", (e) => {
      if (!e.featureState.circleVisible) return;
      this.setCityHoverState(e.feature.id, true);
    });
    layerMouseEvents.cities.on("mouseLeave", (e) => {
      if (!e.featureState.circleVisible) return;
      this.setCityHoverState(e.feature.id, false);
    });
    layerMouseEvents.cities.on("click", (e) => {
      // when clicking on city name, popup should show
      this.#objects.cityMenus.show(this.map, e.feature.id);
    });

    // set up mouse events for interacting with edges
    layerMouseEvents.edges.on("mouseOver", (e) => {
      //journeySummaryPopup.show(e);
      // todo this is broken because have only one journey in state
      this.setEdgeHoverState("journey", e.featureState.journey, true);
    });
    layerMouseEvents.edges.on("mouseLeave", (e) => {
      journeySummaryPopup.hide(e);
      // todo this is broken because have only one journey in state
      this.setEdgeHoverState("journey", e.featureState.journey, false);
    });
    layerMouseEvents.edges.on("click", (e) => {
      if (e.featureState.status === "alternative") {
        this.#callbacks["selectJourney"](e.featureState.journey);
      }
    });

    // set up menu events
    this.map._container.addEventListener("change", (e) => {
      const data = e.target.data;

      // show/hide routes for a city
      if (data.type === "city" && data.entry === "routes") {
        this.#objects.cityMenus.hide(data.cityId);

        if (e.target.checked) this.#callbacks["showCityRoutes"](data.cityName);
        else this.#callbacks["hideCityRoutes"](data.cityName);
      }
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {
    const [cities, edges] = data;

    const cityDiffs = this.#states.cities.update(cities);
    this.#updateCities(cityDiffs);

    const edgeDiffs = this.#states.edges.update(edges);
    this.#updateEdges(edgeDiffs);
  }

  #updateCities(cityDiffs) {
    const toUpdate = [
      "cityMarkers",
      "cityMenus",
      "citySourceData",
      "cityFeatureState",
    ];

    for (let name of toUpdate) {
      const filtered = filterDiffs(cityDiffs, this.#observedKeys[name]);
      this.#objects[name].update(this.map, filtered);
    }
  }

  #updateEdges(edgeDiffs) {
    const toUpdate = ["edgeFeatureState"];
    for (let name of toUpdate) {
      const filtered = filterDiffs(edgeDiffs, this.#observedKeys[name]);
      this.#objects[name].update(this.map, filtered);
    }
  }

  setEdgeHoverState(level, value, state) {
    if (!["leg", "journey"].includes(level))
      throw new Error('Please pass one of ["leg", "journey"]');

    const filter = (entry) => entry[level] === value;
    const ids = this.#states.edges.getMatches(filter);

    for (let id of ids) {
      this.#objects.edgeFeatureState.set(this.map, id, "hover", state);
    }
  }

  setCityHoverState(cityId, state) {
    this.#objects.cityFeatureState.set(this.map, cityId, "hover", state);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
}
