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

function legToGeojson(leg) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [leg.startCity.longitude, leg.startCity.latitude],
        [leg.endCity.longitude, leg.endCity.latitude],
      ],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { id: leg.leg },
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

class LegsManager {
  #map;
  #currentlyActive = [];

  #callbacks = {
    parentHover: () => {},
    parentHoverEnd: () => {},
  };

  constructor(map) {
    this.#map = map;

    let hoverState = null;

    // hover start
    this.#map.on("mouseenter", "legs", (e) => {
      hoverState = e.features.at(-1).id;
      this.#callbacks["hover"](hoverState);
    });

    // hover done
    this.#map.on("mouseleave", "legs", (e) => {
      this.#callbacks["hoverEnd"](hoverState);
      hoverState = null;
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(legs) {
    // for simplicity, unset all previous state
    for (let leg of this.#currentlyActive) {
      const state = {
        active: false,
        color: null,
        parent: null,
        hover: false,
      };
      this.#map.setFeatureState({ source: "legs", id: leg.leg }, state);
    }

    // set new state
    for (let leg of legs) {
      const state = {
        active: true,
        color: `rgb(${leg.color})`,
        parent: leg.parent,
        hover: false,
      };
      this.#map.setFeatureState({ source: "legs", id: leg.leg }, state);
    }

    this.#currentlyActive = legs;
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
      this.#map.setFeatureState({ source: "cities", id: city.city }, state);
    }

    // set new state
    for (let city of cities) {
      const state = { color: `rgb(${city.color})` };
      this.#map.setFeatureState({ source: "cities", id: city.city }, state);
    }
    this.#currentlyActive = cities;

    // can't filter by feature state which things are visible/not visible
    // -> manually set filters by id
    // all cities on the line get a circle
    this.#map.setFilter(
      "city-circle-stops-transfers",
      this.#getIdFilter(cities.map((c) => c.city)),
    );
    // but only transfers also get a name
    this.#map.setFilter(
      "city-name-transfers",
      this.#getIdFilter(cities.filter((c) => c.transfer).map((c) => c.city)),
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

  #legs = null;
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
    const [cities, legs] = data;

    this.map.getCanvas().style.cursor = "default";

    // add cities and legs data
    this.map.addSource("cities", {
      type: "geojson",
      data: asGeojsonFeatureCollection(cities.map(cityToGeojson)),
      promoteId: "name", // otherwise can not use non-numeric ids
    });
    this.map.addSource("legs", {
      type: "geojson",
      data: asGeojsonFeatureCollection(legs.map(legToGeojson)),
      promoteId: "id", // otherwise can not use non-numeric ids
    });

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    // these two abstract away some of the details of dealing with the map items
    this.#legs = new LegsManager(this.map);
    this.#cities = new CityManager(this.map);

    // at mouseleave, map does not give us the id that the mouse left
    // so we need to keep track of it ourselves
    // the (e) => ... is necessary, otherwise we have the wrong "this"
    /*const legsHoverState = new HoverState();
    this.map.on("mouseenter", "legs", (e) => legsHoverState.mouseenter(e));
    this.map.on("mouseleave", "legs", (e) => legsHoverState.mouseleave(e));

    // user has started hovering on a leg
    legsHoverState.on("hover", (leg) => {
      const state = this.#getFeatureState("legs", leg);
      if (state["parent"]) {
        this.#callbacks["legStartHover"](state["parent"]);
        this.setHover(state["parent"]);
      }
    });

    // user has finished hovering on a leg
    legsHoverState.on("hoverEnd", (leg) => {
      const state = this.#getFeatureState("legs", leg);
      if (state["parent"]) {
        this.#callbacks["legStopHover"](state["parent"]);
        this.setNoHover(state["parent"]);
      }
    });*/

    // when the user clicks on a leg, it should be added to the journey
    //this.#legs.onClick((id) => this.#callbacks["legAdded"](id));
    // when the user clicks on a connection, it should be removed from the journey
    //this.#connections.onClick((id) => this.#callbacks["legRemoved"](id));
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check if name is valid
  }

  updateView(data) {
    const [cities, legs] = data;

    // todo it might be visually more pleasing to first
    // todo remove both old legs and cities and then draw the new legs and cities
    this.#legs.updateView(legs);
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
  module.exports.legToGeojson = legToGeojson;
}
