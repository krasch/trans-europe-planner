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
    properties: { id: leg.id },
  };
}

function asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

class MapLayer {
  #callbacks = {};

  constructor(map, sourceName, styleName) {
    this.map = map;
    this.sourceName = sourceName;
    this.styleName = styleName;

    // maplibre mouseout/mouseleave do not give us the id of the item we just left
    // -> we need to some explicit state management
    // to make things extra convenient, we define two new events hover and hoverEnd
    // that already do all the necessary stuff for us
    let hoverState = null;

    this.map.on("mouseenter", this.sourceName, (e) => {
      const id = this.#getIdFromEvent(e);
      hoverState = id;
      this.#makeCallback("hover", id);
    });

    this.map.on("mouseleave", this.sourceName, (e) => {
      if (hoverState) {
        this.#makeCallback("hoverEnd", hoverState);
        hoverState = null;
      }
    });
  }

  update(geojsonData) {
    const dataIsEmpty = geojsonData.features.length === 0;
    const layerAlreadyAdded = this.map.getSource(this.sourceName) !== undefined;

    if (layerAlreadyAdded) {
      if (dataIsEmpty) this.#remove();
      else this.#redraw(geojsonData);
    }
    // layer not added
    else {
      if (!dataIsEmpty) this.#init(geojsonData);
    }
  }

  onClick(callback) {
    this.map.on("click", this.sourceName, (e) => {
      callback(this.#getIdFromEvent(e));
    });
  }

  onHover(callback) {
    this.#callbacks["hover"] = callback; // todo check if hovering is enabled
  }

  onHoverEnd(callback) {
    this.#callbacks["hoverEnd"] = callback; // todo check if hovering is enabled
  }

  setFeatureState(id, state) {
    this.map.setFeatureState({ source: this.sourceName, id: id }, state);
  }

  #init(geojsonData) {
    this.map.addSource(this.sourceName, {
      type: "geojson",
      data: geojsonData,
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addLayer(mapStyles[this.styleName]);
  }

  #redraw(geojsonData) {
    this.map.getSource(this.sourceName).setData(geojsonData);
  }

  #remove() {
    this.map.removeLayer(this.styleName);
    this.map.removeSource(this.sourceName);
  }

  #getIdFromEvent(e) {
    if (e.features.length !== 1)
      throw new Error(`Unexpected event data: ${e.toString()}`);
    return e.features[0].id;
  }

  #makeCallback(eventName, data) {
    if (this.#callbacks[eventName]) this.#callbacks[eventName](data);
  }
}

class MapWrapper {
  #callbacks = {
    legAdded: () => {},
    legRemoved: () => {},
  };
  #legs = null;
  #connections = null;
  #cities = null;

  constructor(containerId, center, zoom) {
    this.map = new maplibregl.Map({
      container: containerId,
      style: "style/outdoors-modified.json",
      center: center,
      zoom: zoom,
    });

    this.#legs = new MapLayer(this.map, "legs", "legs");
    this.#connections = new MapLayer(this.map, "connections", "connections");
    this.#cities = new MapLayer(this.map, "cities", "cities");
  }

  async load() {
    return new Promise((fulfilled, rejected) => {
      this.map.on("load", () => {
        this.init();
        fulfilled();
      });
    });
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name`]);

    // when the user clicks on a leg, it should be added to the journey
    this.#legs.onClick((id) => this.#callbacks["legAdded"](id));
    // when the user clicks on a connection, it should be removed from the journey
    this.#connections.onClick((id) => this.#callbacks["legRemoved"](id));

    // when mouse starts/stops hovering over a leg, it should get highlighted
    this.#legs.onHover((id) => {
      this.#legs.setFeatureState(id, { hover: true });
    });
    this.#legs.onHoverEnd((id) => {
      this.#legs.setFeatureState(id, { hover: false });
    });

    // when mouse starts/stops hovering over a connection, we should send an event (to ourselves and calendar)
    this.#connections.onHover((leg) => {
      this.setHover(leg);
      this.#callbacks["legStartHover"](leg);
    });
    this.#connections.onHoverEnd((leg) => {
      this.setNoHover(leg);
      this.#callbacks["legStopHover"](leg);
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check if name is valid
  }

  updateView(legs) {
    const redLines = legs.filter((l) => l.active).map(legToGeojson);
    this.#connections.update(asGeojsonFeatureCollection(redLines));

    const greyLines = legs.filter((l) => !l.active).map(legToGeojson);
    this.#legs.update(asGeojsonFeatureCollection(greyLines));

    const startCities = legs.map((c) => c.startCity);
    const endCities = legs.map((c) => c.endCity);
    const cities = new Set(startCities.concat(endCities)); // todo only works if city object
    const markers = Array.from(cities).map(cityToGeojson);
    this.#cities.update(asGeojsonFeatureCollection(markers));
  }

  setHover(leg) {
    this.#connections.setFeatureState(leg, { hover: true });
  }

  setNoHover(leg) {
    this.#connections.setFeatureState(leg, { hover: false });
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
