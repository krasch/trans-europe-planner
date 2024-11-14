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

class HoverState {
  #callbacks = {
    hover: () => {},
    hoverEnd: () => {},
  };

  #hoverState = null;

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  mouseenter(e) {
    this.#hoverState = e.features.at(-1).id;
    this.#callbacks["hover"](this.#hoverState);
  }

  mouseleave(e) {
    if (this.#hoverState) {
      this.#callbacks["hoverEnd"](this.#hoverState);
      this.#hoverState = null;
    }
  }
}

class EdgeManager {
  #map;
  #currentlyActive = [];

  #callbacks = {
    hover: () => {},
    hoverEnd: () => {},
  };

  constructor(map) {
    this.#map = map;

    let hoverState = null;

    // hover start
    this.#map.on("mouseenter", "edges", (e) => {
      const edgeId = e.features.at(-1).id;
      const state = this.#map.getFeatureState({ source: "edges", id: edgeId });

      if (state.leg !== hoverState) {
        hoverState = state.leg;
        this.#callbacks["hover"](state.leg);
      }
    });

    // hover done
    this.#map.on("mouseleave", "edges", (e) => {
      this.#callbacks["hoverEnd"](hoverState);
      hoverState = null;
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
        color: null,
        leg: null,
        hover: false,
      };
      this.#map.setFeatureState({ source: "edges", id: edge.id }, state);
    }

    // set new state
    for (let edge of edges) {
      const state = {
        active: true,
        color: `rgb(${edge.color})`,
        leg: edge.leg,
        hover: false,
      };
      this.#map.setFeatureState({ source: "edges", id: edge.id }, state);
    }

    this.#currentlyActive = edges;
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
    legAdded: () => {},
    legRemoved: () => {},
    legStartHover: () => {},
    legStopHover: () => {},
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
    this.#edgeManager.on("hover", (leg) => {
      this.#callbacks["legStartHover"](leg);
      //this.setHover(leg);
    });
    this.#edgeManager.on("hoverEnd", (leg) => {
      this.#callbacks["legStopHover"](leg);
      //this.setHover(leg);
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

  /*setHover(leg) {
    for (let active of this.#currentlyActiveLegs) {
      if (leg !== active.parent) continue;
      this.#updateFeatureState("legs", active.leg, { hover: true });
    }
  }

  setNoHover(leg) {
    for (let active of this.#currentlyActiveLegs) {
      if (leg !== active.parent) continue;
      this.#updateFeatureState("legs", active.leg, { hover: false });
    }
  }*/
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
}
