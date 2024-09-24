function cityToGeojson(city) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [city.coordinates.longitude, city.coordinates.latitude],
    },
    properties: { name: city.name },
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
    properties: { name: leg.name },
    id: leg.numericId,
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

  displayJourney() {
    // add one marker per stopover
    const cities = journey.stopovers;
    const markers = asGeojsonFeatureCollection(cities.map(cityToGeojson));
    this.#addLayerToMap("cities", "cities", "cities", markers);

    // add one line per leg
    const legs = journey.legs;
    const lines = asGeojsonFeatureCollection(legs.map(legToGeojson));
    this.#addLayerToMap("legs", "legs", "legs", lines);

    // when mouse hovers over a leg
    this.map.on("mouseenter", "legs", (e) => {
      if (e.features.length > 0) {
        const legId = e.features[0].id;
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

  #addLayerToMap(sourceName, layerName, styleName, data) {
    this.map.addSource(sourceName, {
      type: "geojson",
      data: data,
    });

    const style = structuredClone(mapStyles[styleName]);
    style["id"] = layerName;
    style["source"] = sourceName;
    this.map.addLayer(style);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
