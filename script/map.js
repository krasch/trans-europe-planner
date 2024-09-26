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

function connectionToGeojson(connection) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [
          connection.startStation.city.coordinates.longitude,
          connection.startStation.city.coordinates.latitude,
        ],
        [
          connection.endStation.city.coordinates.longitude,
          connection.endStation.city.coordinates.latitude,
        ],
      ],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { id: connection.leg },
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
}

class MapWrapper {
  #currentHover = null;
  #citiesLayer = null;
  #connectionsLayer = null;

  constructor(map) {
    this.map = map;
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

    this.#citiesLayer = new MapLayer(this.map, "cities", "cities");
    this.#connectionsLayer = new MapLayer(this.map, "legs", "legs");

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
  }

  updateView(journey) {
    const markers = journey.stopovers.map(cityToGeojson);
    this.#citiesLayer.update(asGeojsonFeatureCollection(markers));

    const lines = journey.connections.map(connectionToGeojson);
    this.#connectionsLayer.update(asGeojsonFeatureCollection(lines));

    // todo this is not nice
    /*for (let connection of journey.connections) {
      this.#connectionsLayer.setFeatureState(connection.leg, {
        addedToJourney: true,
      });
    }*/
  }

  #setHover(legId) {
    this.#currentHover = legId;
    this.#connectionsLayer.setFeatureState(legId, { hover: true });
  }

  #setNoHover(legId) {
    this.#currentHover = null;
    this.#connectionsLayer.setFeatureState(legId, { hover: false });
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.connectionToGeojson = connectionToGeojson;
}
