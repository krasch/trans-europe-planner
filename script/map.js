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
  constructor(map, sourceName, styleName) {
    this.map = map;
    this.sourceName = sourceName;
    this.styleName = styleName;
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

  on(eventName, callback) {
    this.map.on(eventName, this.sourceName, callback);
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
}

class MapWrapper {
  #callbacks = {};
  #currentHover = null;
  #citiesLayer = null;
  #connectionsLayer = null;
  #legLayer = null;

  #layers = null;

  constructor(map) {
    this.map = map;

    this.#legLayer = new MapLayer(this.map, "legs", "legs");
    this.#connectionsLayer = new MapLayer(
      this.map,
      "connections",
      "connections",
    );
    this.#citiesLayer = new MapLayer(this.map, "cities", "cities");
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

    document.addEventListener("legHover", (e) => this.#setHover(e.detail.leg));
    document.addEventListener("legNoHover", (e) =>
      this.#setNoHover(e.detail.leg),
    );

    // when mouse starts hovering over a leg
    this.#connectionsLayer.on("mouseenter", (e) => {
      if (e.features.length > 0) {
        const leg = e.features[0].properties["id"];
        new LegHoverEvent(leg).dispatch(document);
      }
    });

    // when mouse stops hovering over a leg
    this.#connectionsLayer.on("mouseout", (e) => {
      const leg = this.#currentHover;
      if (leg) new LegNoHoverEvent(leg).dispatch(document);
    });

    this.#legLayer.on("click", (e) => {
      if (e.features.length > 0) {
        const leg = e.features[0].properties["id"];
        this.#makeCallback("legAdded", leg);
      }
    });
  }

  on(event, callback) {
    this.#callbacks[event] = callback;
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
    this.#citiesLayer.update(asGeojsonFeatureCollection(markers));

    // legs we have on our route
    const redLines = legsInJourney.map(legToGeojson);
    this.#connectionsLayer.update(asGeojsonFeatureCollection(redLines));

    // legs currently not in use
    const lines = additionalLegs.map(legToGeojson);
    this.#legLayer.update(asGeojsonFeatureCollection(lines));
  }

  #setHover(legId) {
    this.#currentHover = legId;
    this.map.setFeatureState(
      { source: "connections", id: legId },
      { hover: true },
    );
  }

  #setNoHover(legId) {
    this.#currentHover = null;
    this.map.setFeatureState(
      { source: "connections", id: legId },
      { hover: false },
    );
  }

  #makeCallback(event, data) {
    if (this.#callbacks[event]) this.#callbacks[event](data);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
