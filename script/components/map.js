function cityToGeojson(city) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [city.longitude, city.latitude],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { name: city.name, id: city.name },
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

class MapWrapper {
  #callbacks = {
    legAdded: () => {},
    legRemoved: () => {},
    legStartHover: () => {},
    legStopHover: () => {},
  };

  #currentlyActiveLegs = [];

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

  init(legs) {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name`]);

    // add legs layer
    this.map.addSource("legs", {
      type: "geojson",
      data: asGeojsonFeatureCollection(legs.map(legToGeojson)),
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addLayer(mapStyles["legs"]);

    // at mouseleave, map does not give us the id that the mouse left
    // so we need to keep track of it ourselves
    // the (e) => ... is necessary, otherwise we have the wrong "this"
    const legsHoverState = new HoverState();
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
    });

    // when the user clicks on a leg, it should be added to the journey
    //this.#legs.onClick((id) => this.#callbacks["legAdded"](id));
    // when the user clicks on a connection, it should be removed from the journey
    //this.#connections.onClick((id) => this.#callbacks["legRemoved"](id));
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check if name is valid
  }

  updateView(data) {
    const activeLegs = data;

    // for simplicity, unset all previously active legs
    for (let leg of this.#currentlyActiveLegs) {
      this.#setFeatureState("legs", leg.leg, {
        active: false,
        color: null,
        parent: null,
        hover: false,
      });
    }

    // draw new active legs
    for (let leg of activeLegs) {
      this.#setFeatureState("legs", leg.leg, {
        active: true,
        color: `rgb(${leg.color})`,
        parent: leg.parent,
        hover: false,
      });
    }
    this.#currentlyActiveLegs = activeLegs;

    /*const [legs, color] = data; // todo fold into legs

    const coloredLines = legs.filter((l) => l.active).map(legToGeojson);
    this.#connections.update(asGeojsonFeatureCollection(coloredLines));
    this.#connections.setPaintProperty("line-color", `rgb(${color})`);

    const greyLines = legs.filter((l) => !l.active).map(legToGeojson);
    this.#legs.update(asGeojsonFeatureCollection(greyLines));

    const startCities = legs.filter((l) => l.active).map((c) => c.startCity);
    const endCities = legs.filter((l) => l.active).map((c) => c.endCity);
    const cities = new Set(startCities.concat(endCities)); // todo only works if city object
    const markers = Array.from(cities).map(cityToGeojson);
    this.#cities.update(asGeojsonFeatureCollection(markers));*/
  }

  setHover(leg) {
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
  }

  #getFeatureState(source, id) {
    return this.map.getFeatureState({ source: source, id: id });
  }

  #setFeatureState(source, id, state) {
    this.map.setFeatureState({ source: source, id: id }, state);
  }

  #updateFeatureState(source, id, newState) {
    const state = this.#getFeatureState(source, id);
    for (let key in newState) state[key] = newState[key];
    this.#setFeatureState(source, id, state);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
