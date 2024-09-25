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

class MapWrapper {
  #currentHover = null;

  constructor(map) {
    this.map = map;
  }

  init() {
    this.map.getCanvas().style.cursor = "default";
    this.map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

    document.addEventListener("legHover", (e) => this.setHover(e.detail.leg));
    document.addEventListener("legNoHover", (e) =>
      this.setNoHover(e.detail.leg),
    );
  }

  setHover(legId) {
    this.#currentHover = legId;
    this.map.setFeatureState({ source: "legs", id: legId }, { hover: true });
  }

  setNoHover(legId) {
    this.#currentHover = null;
    this.map.setFeatureState({ source: "legs", id: legId }, { hover: false });
  }

  displayJourney(journey) {
    this.#initCitiesLayer(journey.stopovers);
    this.#initLegsLayer(journey.connections);
  }

  #initCitiesLayer(cities) {
    const markers = asGeojsonFeatureCollection(cities.map(cityToGeojson));

    this.map.addSource("cities", {
      type: "geojson",
      data: markers,
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addLayer(mapStyles["cities"]);
  }

  #updateCitiesLayer(cities) {
    const markers = asGeojsonFeatureCollection(cities.map(cityToGeojson));
    this.map.getSource("cities").setData(markers);
  }

  #initLegsLayer(connections) {
    const lines = asGeojsonFeatureCollection(
      connections.map(connectionToGeojson),
    );

    this.map.addSource("legs", {
      type: "geojson",
      data: lines,
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addLayer(mapStyles["legs"]);

    // when mouse starts hovering over a leg
    this.map.on("mouseenter", "legs", (e) => {
      if (e.features.length > 0) {
        const leg = e.features[0].properties["id"];
        new LegHoverEvent(leg).dispatch(document);
      }
    });

    // when mouse stops hovering over a leg
    this.map.on("mouseout", "legs", (e) => {
      const leg = this.#currentHover;
      if (leg) new LegNoHoverEvent(leg).dispatch(document);
    });
  }

  #updateLegsLayer(connections) {
    const lines = asGeojsonFeatureCollection(
      connections.map(connectionToGeojson),
    );
    this.map.getSource("legs").setData(lines);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.connectionToGeojson = connectionToGeojson;
}
