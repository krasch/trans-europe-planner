function cityToGeojson(city) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [city.coordinates.longitude, city.coordinates.latitude],
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
        [
          leg.startCity.coordinates.longitude,
          leg.startCity.coordinates.latitude,
        ],
        [leg.endCity.coordinates.longitude, leg.endCity.coordinates.latitude],
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
  #callbacks = {};
  #legs = null;
  #connections = null;
  #cities = null;

  constructor(map) {
    this.map = map;

    this.#legs = new MapLayer(this.map, "legs", "legs");
    this.#connections = new MapLayer(this.map, "connections", "connections");
    this.#cities = new MapLayer(this.map, "cities", "cities");
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name`]);

    // when the user clicks on a leg, it should be added to the journey
    this.#legs.onClick((id) => this.#makeCallback("legAdded", id));
    // when the user clicks on a connection, it should be removed from the journey
    this.#connections.onClick((id) => this.#makeCallback("legRemoved", id));

    // when mouse starts/stops hovering over a leg, it should get highlighted
    this.#legs.onHover((id) => {
      this.#legs.setFeatureState(id, { hover: true });
    });
    this.#legs.onHoverEnd((id) => {
      this.#legs.setFeatureState(id, { hover: false });
    });

    // when mouse starts/stops hovering over a connection, we should send an event (to ourselves and calendar)
    this.#connections.onHover((id) => {
      new LegHoverEvent(id, "map").dispatch(document);
    });
    this.#connections.onHoverEnd((id) => {
      new LegNoHoverEvent(id, "map").dispatch(document);
    });

    // when we get informed us that the user is hovering over a connection (in map or calendar)
    // then that connection should get highlighted
    // we also want to hover (but not when that information originally came from us)
    document.addEventListener("legHover", (e) => {
      this.#connections.setFeatureState(e.detail.leg, { hover: true });
    });
    document.addEventListener("legNoHover", (e) => {
      this.#connections.setFeatureState(e.detail.leg, { hover: false });
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  #makeCallback(eventName, data) {
    if (this.#callbacks[eventName]) this.#callbacks[eventName](data);
  }

  updateView(availableLegs, journey) {
    const legsInJourney = [];
    const additionalLegs = [];

    for (let leg of availableLegs) {
      if (journey.hasLeg(leg)) legsInJourney.push(leg);
      else additionalLegs.push(leg);
    }

    // actual cities we have on our network
    const cities = [];
    for (let leg of availableLegs) {
      if (!cities.includes(leg.startCity)) cities.push(leg.startCity);
      if (!cities.includes(leg.endCity)) cities.push(leg.endCity);
    }

    const markers = cities.map(cityToGeojson);
    //const markers = journey.stopovers.map(cityToGeojson);
    this.#cities.update(asGeojsonFeatureCollection(markers));

    // legs we have on our route
    const redLines = legsInJourney.map(legToGeojson);
    this.#connections.update(asGeojsonFeatureCollection(redLines));

    // legs currently not in use
    const lines = additionalLegs.map(legToGeojson);
    this.#legs.update(asGeojsonFeatureCollection(lines));
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
