const CITY_NAME_LAYERS = [
  "city-name",
  "city-name-transfer-alternative",
  "city-name-transfer-active",
];

const EDGE_LAYERS = ["edges"];

const CITY_DEFAULT_STATE = {
  color: null,
  stop: false,
  transfer: false,
};

const EDGE_DEFAULT_STATE = {
  status: null,
  color: null,
  leg: null,
  journey: null,
  journeyTravelTime: null,
  hover: false,
};

function cityToGeojson(city) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [city.longitude, city.latitude],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { name: city.name, id: city.name, rank: city.rank },
  };
}

function edgeToGeojson(edge) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [edge.startCity.longitude, edge.startCity.latitude],
        [edge.endCity.longitude, edge.endCity.latitude],
      ],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { id: edge.id },
  };
}

function asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

// utility class to for dealing with FeatureStates of a map source
class FeatureStateManager {
  #map;
  #source;
  #initialState;

  // keeping a mirror of the feature state so that
  // don't need to do getFeatureState all the time
  #mirror = new Map();

  constructor(map, source, initialState) {
    this.#map = map;
    this.#source = source;
    this.#initialState = initialState;
  }

  // sets feature state for all items
  // if items are not in newStates, they are reset to the initial state
  setNewState(newStates) {
    // things that are now relevant
    const updatedIds = [];
    for (let update of newStates) {
      const id = update.id;

      // either get the current state or init
      let current = this.#mirror.get(id) ?? this.#initialState;

      // keeps all keys from current and updates them with data from update
      const updated = { ...current, ...update };

      // apply update
      this.#mirror.set(id, updated);
      this.#map.setFeatureState({ source: this.#source, id: id }, update);

      updatedIds.push(id);
    }

    // things that are no longer relevant -> reset to initial state
    for (let id of this.#mirror.keys()) {
      if (!updatedIds.includes(id)) {
        const updated = { ...this.#initialState };

        // apply update
        this.#mirror.set(id, updated);
        this.#map.setFeatureState({ source: this.#source, id: id }, updated);
      }
    }
  }

  // updates only selected items, does not touch items that do not match the filter
  updateSelected(filterFn, update) {
    for (let [id, entry] of this.#mirror.entries()) {
      if (!filterFn(entry)) continue;

      // keeps all keys from current entry and updates them with data from update
      const updated = { ...entry, ...update };

      // apply update
      this.#mirror.set(id, updated);
      this.#map.setFeatureState({ source: this.#source, id: id }, update);
    }
  }
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
    alternativeJourneyClicked: () => {},
    cityHoverStart: () => {},
    cityHoverEnd: () => {},
  };

  #featureStates = null;

  #journeyHoverPopup = { popup: null, journeyId: null };

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
      this.map.on("load", () => {
        try {
          this.init(cities, legs);
          fulfilled();
        } catch (error) {
          rejected(error);
        }
      });
    });
  }

  init(data) {
    const [cities, edges] = data;

    this.map.getCanvas().style.cursor = "default";

    // add cities and legs sources
    this.map.addSource("cities", {
      type: "geojson",
      data: asGeojsonFeatureCollection(cities.map(cityToGeojson)),
      promoteId: "name", // otherwise can not use non-numeric ids
    });
    this.map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection(edges.map(edgeToGeojson)),
      promoteId: "id", // otherwise can not use non-numeric ids
    });

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    // initialise features states for cities and edge sources
    this.#featureStates = {
      edges: new FeatureStateManager(this.map, "edges", EDGE_DEFAULT_STATE),
      cities: new FeatureStateManager(this.map, "cities", CITY_DEFAULT_STATE),
    };

    // initialise mouse event helper for cities and edge layers
    const mouseEvents = {
      cityNames: new MouseEventHelper(this.map, CITY_NAME_LAYERS),
      edges: new MouseEventHelper(this.map, EDGE_LAYERS, true),
    };

    // set up mouse events for interacting with city names
    mouseEvents.cityNames.on("mouseOver", (e) => {
      this.#callbacks["cityHoverStart"](e.feature.id);
    });
    mouseEvents.cityNames.on("mouseLeave", (e) =>
      this.#callbacks["cityHoverEnd"](e.feature.id),
    );

    // set up mouse events for edges
    mouseEvents.edges.on("mouseOver", (e) => {
      this.#showJourneySummaryPopup(e);
      this.setHoverState("journey", e.featureState.journey, true);
    });
    mouseEvents.edges.on("mouseLeave", (e) => {
      this.#hideJourneySummaryPopup();
      this.setHoverState("journey", e.featureState.journey, false);
    });
    mouseEvents.edges.on("click", (e) => {
      if (e.featureState.status === "alternative")
        this.#callbacks["alternativeJourneyClicked"](e.featureState.journey);
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {
    const [cities, edges] = data;
    this.#featureStates.cities.setNewState(cities);
    this.#featureStates.edges.setNewState(edges);

    const transfers = cities.filter((c) => c.transfer);

    // all stops should have visible circle
    this.#updateFilter("city-circle", cities);

    // for displaying names, non-transfer cities have lowest priority
    // (need to give transfer cities because of !in query)
    this.#updateFilter("city-name", transfers);
    // next highest priority to transfers in alternative journeys
    this.#updateFilter(
      "city-name-transfer-alternative",
      transfers.filter((c) => !c.active),
    );
    // highest priority to transfers in active journey
    this.#updateFilter(
      "city-name-transfer-active",
      transfers.filter((c) => c.active),
    );
  }

  #updateFilter(layer, cities) {
    const filter = this.map.getFilter(layer);
    updateFilterExpression(
      layer,
      filter,
      cities.map((c) => c.id),
    );
    this.map.setFilter(layer, filter);
  }

  setHoverState(level, value, state) {
    if (!["leg", "journey"].includes(level))
      throw new Error('Please pass one of ["leg", "journey"]');

    const filter = (entry) => entry[level] === value;
    const update = { hover: state };

    this.#featureStates.edges.updateSelected(filter, update);
  }

  #showJourneySummaryPopup(e) {
    // popup is currently being shown for this journey
    if (this.#journeyHoverPopup.journeyId === e.featureState.journey) return;

    // just in case a popup is currently being shown for some other journey (should not happen)
    this.#hideJourneySummaryPopup();

    this.#journeyHoverPopup.journeyId = e.featureState.journey;
    this.#journeyHoverPopup.popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      anchor: "left",
      offset: [10, 0],
    });
    this.#journeyHoverPopup.popup
      .setLngLat(e.lngLat)
      .setHTML(e.featureState.journeyTravelTime)
      .addTo(this.map);
  }

  #hideJourneySummaryPopup() {
    if (this.#journeyHoverPopup.popup) {
      this.#journeyHoverPopup.popup.remove();
      this.#journeyHoverPopup.journeyId = null;
    }
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
  module.exports.FeatureStateManager = FeatureStateManager;
}
