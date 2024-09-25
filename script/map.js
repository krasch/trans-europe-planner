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
  }

  setHover(legId) {
    this.map.setFeatureState({ source: "legs", id: legId }, { hover: true });
  }

  setNoHover(legId) {
    this.map.setFeatureState({ source: "legs", id: legId }, { hover: false });
  }

  #updateHover(legId) {
    this.#hoverOff();
    this.#currentHover = legId;
    this.setHover(legId);
  }

  #hoverOff() {
    if (this.#currentHover) this.setNoHover(this.#currentHover);
    this.#currentHover = null;
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
        const legId = e.features[0].properties["id"];
        this.#updateHover(legId);

        // todo this should be in calender
        for (let connection of document.getElementsByClassName(legId)) {
          connection.classList.add("legSelected");
        }
      }
    });

    // when mouse stops hovering over a leg
    this.map.on("mouseout", "legs", (e) => {
      const legId = this.#currentHover;
      // todo this should be in calender
      for (let connection of document.getElementsByClassName(legId)) {
        connection.classList.remove("legSelected");
      }
      this.#hoverOff();
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
