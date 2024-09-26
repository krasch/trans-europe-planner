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

// todo should this really be extra class
// should hover callbacks be added here?
class HoverStateManager {
  #currentHover = null;

  constructor(map, sourceName) {
    this.map = map;
    this.sourceName = sourceName;
  }

  get current() {
    return this.#currentHover;
  }

  setHover(id) {
    this.#currentHover = id;
    this.map.setFeatureState(
      { source: this.sourceName, id: id },
      { hover: true },
    );
  }

  setNoHover(id) {
    this.#currentHover = null;
    this.map.setFeatureState(
      { source: this.sourceName, id: id },
      { hover: false },
    );
  }
}

class MapLayer {
  #callbacks = {};

  constructor(map, sourceName, styleName, enableHover = false) {
    this.map = map;
    this.sourceName = sourceName;
    this.styleName = styleName;

    if (enableHover) {
      this.hover = new HoverStateManager(this.map, this.sourceName);

      this.map.on("mouseenter", this.sourceName, (e) => {
        const id = this.#getIdFromEvent(e);
        this.hover.setHover(id);
        this.#makeCallback("hover", id);
      });

      this.map.on("mouseleave", this.sourceName, (e) => {
        const id = this.hover.current;
        if (id) {
          this.hover.setNoHover(id);
          this.#makeCallback("hoverEnd", id);
        }
      });
    }
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

    this.#legs = new MapLayer(this.map, "legs", "legs", true);
    this.#connections = new MapLayer(
      this.map,
      "connections",
      "connections",
      true,
    );
    this.#cities = new MapLayer(this.map, "cities", "cities");
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

    // when the user clicks on a leg, it should be added to the journey
    this.#legs.onClick((id) => this.#makeCallback("legAdded", id));
    // when the user clicks on a connection, it should be removed from the journey
    this.#connections.onClick((id) => this.#makeCallback("legRemoved", id));

    // when mouse starts/stops hovering over a connection, the calendar should be informed
    this.#connections.onHover((id) => {
      new LegHoverEvent(id, "map").dispatch(document);
    });
    this.#connections.onHoverEnd((id) => {
      new LegNoHoverEvent(id, "map").dispatch(document);
    });

    // when we get informed us that the user is hovering over a connection (e.g. in the calendar)
    // we also want to hover (but not when that information originally came from us)
    document.addEventListener("legHover", (e) => {
      if (e.detail.source !== "map")
        this.#connections.hover.setHover(e.detail.leg);
    });
    document.addEventListener("legNoHover", (e) => {
      if (e.detail.source !== "map")
        this.#connections.hover.setNoHover(e.detail.leg);
    });
  }

  on(event, callback) {
    this.#callbacks[event] = callback;
  }

  #makeCallback(event, data) {
    if (this.#callbacks[event]) this.#callbacks[event](data);
  }

  updateView(availableLegs, journey) {
    const legsInJourney = [];
    const additionalLegs = [];

    for (let leg of availableLegs) {
      if (journey.hasLeg(leg)) legsInJourney.push(leg);
      else additionalLegs.push(leg);
    }

    // actual cities we have on our route
    const markers = journey.stopovers.map(cityToGeojson);
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
