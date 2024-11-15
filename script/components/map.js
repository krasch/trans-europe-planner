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

class EdgeManager {
  #map;
  #currentlyActive = [];

  #callbacks = {
    activeLegHoverStart: () => {},
    activeLegHoverStop: () => {},
    alternativeJourneyClicked: () => {},
  };

  constructor(map) {
    this.#map = map;

    let hoverState = null;

    // hover start
    this.#map.on("mouseenter", "edges", (e) => {
      const edgeId = e.features.at(-1).id;
      const state = this.#map.getFeatureState({ source: "edges", id: edgeId });

      // nothing changed, this can happen for example when directly hovering from one edge to next of same leg
      if (state.leg === hoverState) return;

      hoverState = state.leg;
      if (state.status === "active")
        this.#callbacks["activeLegHoverStart"](state.leg);
    });

    // hover done
    this.#map.on("mouseleave", "edges", (e) => {
      if (hoverState) {
        this.#callbacks["activeLegHoverStop"](hoverState);
        hoverState = null;
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
    // for simplicity, unset all previous state
    for (let edge of this.#currentlyActive) {
      const state = {
        active: false,
        alternative: false,
        color: null,
        leg: null,
        hover: false,
      };
      this.#map.setFeatureState({ source: "edges", id: edge.id }, state);
    }

    // set new state
    for (let edge of edges) {
      const state = {
        status: edge.status,
        color: `rgb(${edge.color})`,
        leg: edge.leg,
        journey: edge.journey,
        hover: false,
      };
      this.#map.setFeatureState({ source: "edges", id: edge.id }, state);
    }

    this.#currentlyActive = edges;
  }

  setHoverLeg(leg) {
    for (let edge of this.#currentlyActive) {
      if (leg !== edge.leg) continue;
      this.#updateFeatureState(edge.id, { hover: true });
    }
  }

  setNoHoverLeg(leg) {
    for (let edge of this.#currentlyActive) {
      if (leg !== edge.leg) continue;
      this.#updateFeatureState(edge.id, { hover: false });
    }
  }

  #updateFeatureState(id, newState) {
    const state = this.#map.getFeatureState({ source: "edges", id: id });
    for (let key in newState) state[key] = newState[key];
    this.#map.setFeatureState({ source: "edges", id: id }, state);
  }
}

class CityManager {
  #map;
  #currentlyActive = [];

  constructor(map) {
    this.#map = map;
  }

  updateView(cities) {
    // for simplicity, unset previously state
    for (let city of this.#currentlyActive) {
      const state = { color: null };
      this.#map.setFeatureState({ source: "cities", id: city.name }, state);
    }

    // set new state
    for (let city of cities) {
      const state = { color: `rgb(${city.color})` };
      this.#map.setFeatureState({ source: "cities", id: city.name }, state);
    }
    this.#currentlyActive = cities;

    // can't filter by feature state which things are visible/not visible
    // -> manually set filters by id
    // all cities on the line get a circle
    this.#map.setFilter(
      "city-circle-stops-transfers",
      this.#getIdFilter(cities.map((c) => c.name)),
    );
    // but only transfers also get a name
    this.#map.setFilter(
      "city-name-transfers",
      this.#getIdFilter(cities.filter((c) => c.transfer).map((c) => c.name)),
    );
  }

  #getIdFilter(items) {
    const filter = ["in", "id"];
    for (let i of items) filter.push(i);
    return filter;
  }
}

class MapWrapper {
  #callbacks = {
    legHoverStart: () => {},
    legHoverStop: () => {},
    journeySelected: () => {},
  };

  #edgeManager = null;
  #cities = null;

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

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    // these two abstract away some of the details of dealing with the map items
    this.#edgeManager = new EdgeManager(this.map);
    this.#cities = new CityManager(this.map);

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
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check if name is valid
  }

  updateView(data) {
    const [cities, legs] = data;

    // todo it might be visually more pleasing to first
    // todo remove both old legs and cities and then draw the new legs and cities
    this.#edgeManager.updateView(legs);
    this.#cities.updateView(cities);
  }

  setHoverLeg(leg) {
    this.#edgeManager.setHoverLeg(leg);
  }

  setNoHoverLeg(leg) {
    this.#edgeManager.setNoHoverLeg(leg);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
}
