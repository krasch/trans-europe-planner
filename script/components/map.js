const CITY_NAME_LAYERS = [
  "city-name",
  "city-name-transfer-alternative",
  "city-name-transfer-active",
];

const EDGE_DEFAULT_FEATURE_STATE = {
  status: null,
  color: null,
  leg: null,
  journey: null,
  journeyTravelTime: null,
  hover: false,
};

const CITY_DEFAULT_FEATURE_STATE = {
  color: null,
  stop: false,
  transfer: false,
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

class StateChangeObserver {
  #initialState;

  // maps id to state dict
  #state = new Map();

  constructor(initialState) {
    this.#initialState = initialState;
  }

  *updateAll(newStates) {
    // things that are now relevant
    const updatedIds = [];
    for (let update of newStates) {
      const id = update.id;

      // either get the current state or init
      let current = this.#state.get(id) ?? this.#initialState;

      // keeps all keys from current and updates them with data from update
      const updated = { ...current, ...update };

      this.#state.set(id, updated);
      updatedIds.push(id);

      yield [id, updated];
    }

    // things that are no longer relevant -> reset to initial state
    for (let id of this.#state.keys()) {
      if (!updatedIds.includes(id)) {
        const updated = { ...this.#initialState };
        this.#state.set(id, updated);

        yield [id, updated];
      }
    }
  }

  *updateSelected(filterFn, update) {
    for (let [id, entry] of this.#state.entries()) {
      if (!filterFn(entry)) continue;

      // keeps all keys from current entry and updates them with data from update
      const updated = { ...entry, ...update };

      this.#state.set(id, updated);
      yield [id, updated];
    }
  }
}

class MouseEventHelper {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
  };

  constructor(map, layerNames) {
    let mouseOverState = null;

    const mouseOver = (e) => {
      mouseOverState = e.features;
      this.#callbacks["mouseOver"](e);
    };

    const mouseLeave = (e) => {
      if (mouseOverState) {
        e.features = mouseOverState; // these are not provided by maplibre
        this.#callbacks["mouseLeave"](e);
        mouseOverState = null;
      }
    };

    for (let layer of layerNames) {
      map.on("mouseover", layer, (e) => mouseOver(e));
      map.on("mouseleave", layer, (e) => mouseLeave(e));
      map.on("click", layer, (e) => this.#callbacks["click"](e));
    }
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }
}

class EdgeManager {
  #map;

  #hoverState = { edge: null, leg: null, journey: null };
  #featureStates;

  #callbacks = {
    activeLegHoverStart: () => {},
    activeLegHoverStop: () => {},
    alternativeJourneyClicked: () => {},
  };

  constructor(map) {
    this.#map = map;

    this.#featureStates = new StateChangeObserver(EDGE_DEFAULT_FEATURE_STATE);

    let hoverPopup = null;

    // hover start
    this.#map.on("mouseover", "edges", (e) => {
      const edgeId = e.features.at(-1).id;
      const state = this.#map.getFeatureState({ source: "edges", id: edgeId });

      // check what changed
      const changed = {
        edge: this.#hoverState.edge !== edgeId,
        leg: this.#hoverState.leg !== state.leg,
        journey: this.#hoverState.journey !== state.journey,
      };

      // update hover state
      this.#hoverState = { id: edgeId, leg: state.leg, journey: state.journey };

      // react to changes
      if (changed.journey) {
        this.startShowHover("journey", state.journey);

        hoverPopup = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          anchor: "left",
          offset: [10, 0],
        });
        hoverPopup
          .setLngLat(e.lngLat)
          .setHTML(state.journeyTravelTime)
          .addTo(map);
      }
    });

    // hover done
    this.#map.on("mouseleave", "edges", (e) => {
      if (this.#hoverState.journey)
        this.stopShowHover("journey", this.#hoverState.journey);

      this.#hoverState = { edge: null, leg: null, journey: null };

      if (hoverPopup) {
        hoverPopup.remove();
        hoverPopup = null;
      }
    });

    // click
    this.#map.on("click", "edges", (e) => {
      const edgeId = e.features.at(-1).id;
      const state = this.#map.getFeatureState({ source: "edges", id: edgeId });

      if (state.status === "alternative")
        this.#callbacks["alternativeJourneyClicked"](state.journey);
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(edges) {
    for (let [id, update] of this.#featureStates.updateAll(edges)) {
      this.#map.setFeatureState({ source: "edges", id: id }, update);
    }
  }

  startShowHover(key, value) {
    if (!["id", "leg", "journey"].includes(key))
      throw new Error('Please pass one of ["id", "leg", "journey"]');

    const filter = (entry) => entry[key] === value;
    const update = { hover: true };
    const updates = this.#featureStates.updateSelected(filter, update);

    for (let [id, update] of updates) {
      this.#map.setFeatureState({ source: "edges", id: id }, update);
    }
  }

  stopShowHover(key, value) {
    if (!["id", "leg", "journey"].includes(key))
      throw new Error('Please pass one of ["id", "leg", "journey"]');

    const filter = (entry) => entry[key] === value;
    const update = { hover: false };
    const updates = this.#featureStates.updateSelected(filter, update);

    for (let [id, update] of updates) {
      this.#map.setFeatureState({ source: "edges", id: id }, update);
    }
  }
}

class CityManager {
  #map;
  #featureStates;

  #callbacks = {
    click: () => {},
    hover: () => {},
  };

  constructor(map) {
    this.#map = map;

    this.#featureStates = new StateChangeObserver(CITY_DEFAULT_FEATURE_STATE);

    const mouseEvents = new MouseEventHelper(this.#map, CITY_NAME_LAYERS);

    mouseEvents.on("mouseOver", (e) =>
      this.#callbacks["hover"](e.features.at(-1).id),
    );
    mouseEvents.on("mouseLeave", (e) =>
      this.#callbacks["hoverEnd"](e.features.at(-1).id),
    );
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(cities) {
    for (let [id, update] of this.#featureStates.updateAll(cities)) {
      this.#map.setFeatureState({ source: "cities", id: id }, update);
    }

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
    const filter = this.#map.getFilter(layer);
    updateFilterExpression(
      layer,
      filter,
      cities.map((c) => c.id),
    );
    this.#map.setFilter(layer, filter);
  }
}

class MapWrapper {
  #callbacks = {
    legHoverStart: () => {},
    legHoverStop: () => {},
    journeySelected: () => {},
    citySelected: () => {},
  };

  #edgeManager = null;
  #cityManager = null;

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

    // add cities and legs data
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

    // todo have a feature state manager for cities and edges
    /*takes as input the ids and the initial feature state
    on update it calculates a diff and puts the new feature state
    should also allow to set initial feature attributes such as setHover    
    (sdfsdfdsfsf )*/

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    // these two abstract away some of the details of dealing with the map items
    this.#edgeManager = new EdgeManager(this.map);
    this.#cityManager = new CityManager(this.map);

    // user has started hovering on a leg
    this.#edgeManager.on("activeLegHoverStart", (leg) => {
      this.#callbacks["legHoverStart"](leg);
      this.#edgeManager.setHoverLeg(leg);
    });
    this.#edgeManager.on("activeLegHoverStop", (leg) => {
      this.#callbacks["legHoverStop"](leg);
      this.#edgeManager.setNoHoverLeg(leg);
    });

    // user has clicked on an alternative journey
    this.#edgeManager.on("alternativeJourneyClicked", (journey) => {
      this.#callbacks["journeySelected"](journey);
    });

    // user has clicked on a city
    this.#cityManager.on("hover", (city) => this.#callbacks["cityHover"](city));

    this.#cityManager.on("hoverEnd", (city) =>
      this.#callbacks["cityHoverEnd"](city),
    );
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check if name is valid
  }

  updateView(data) {
    const [cities, legs] = data;

    // todo it might be visually more pleasing to first
    // todo remove both old legs and cities and then draw the new legs and cities
    this.#edgeManager.updateView(legs);
    this.#cityManager.updateView(cities);
  }

  setHoverLeg(leg) {
    this.#edgeManager.startShowHover("leg", leg);
  }

  setNoHoverLeg(leg) {
    this.#edgeManager.stopShowHover("leg", leg);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
  module.exports.FeatureStateManager = FeatureStateManager;
}
