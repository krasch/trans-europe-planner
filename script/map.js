let currentHovered = null;

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

function initMap(map) {
  map.getCanvas().style.cursor = "default";
  map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

  /*const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true
    });

    map.on('mouseenter', 'route-layer', (e) => {
        popup.setLngLat(e.lngLat).setHTML("test").addTo(map);
    });*/

  /*map.on('mouseleave', 'route-layer', () => {
      popup.remove();
    });*/
}

function setHover(map, legId) {
  map.setFeatureState({ source: "legs", id: legId }, { hover: true });
}

function setNoHover(map, legId) {
  map.setFeatureState({ source: "legs", id: legId }, { hover: false });
}

function addToMap(map, styleName, geojsonData) {
  const sourceName = styleName;
  const layerName = styleName;

  map.addSource(sourceName, {
    type: "geojson",
    data: geojsonData,
  });

  const style = structuredClone(mapStyles[styleName]);
  style["id"] = layerName;
  style["source"] = sourceName;
  map.addLayer(style);
}

function displayJourneyOnMap(map, journey) {
  const cityMarkers = journey.stopovers.map(cityToGeojson);
  addToMap(map, "cityMarkers", asGeojsonFeatureCollection(cityMarkers));

  const legs = journey.legs.map(legToGeojson);
  addToMap(map, "legs", asGeojsonFeatureCollection(legs));

  map.on("mouseenter", "legs", (e) => {
    if (e.features.length > 0) {
      const newHovered = e.features[0].id;

      if (currentHovered && currentHovered !== newHovered)
        setNoHover(map, newHovered);

      currentHovered = newHovered;
      setHover(map, newHovered);

      for (let connection of document.getElementsByClassName(newHovered)) {
        connection.classList.add("legSelected");
      }
    }
  });

  map.on("mouseout", "legs", (e) => {
    if (currentHovered) setNoHover(map, currentHovered);

    for (let connection of document.getElementsByClassName(currentHovered)) {
      connection.classList.remove("legSelected");
    }
  });
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = legToGeojson;
}
