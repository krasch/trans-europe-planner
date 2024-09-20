let hoveredTrainId = null;

// todo this is actually city to json
function stationToGeojson(station) {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [station.city_longitude, station.city_latitude],
    },
    properties: { name: station.city },
  };
}

function trainToGeojson(train) {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [train.startStation.longitude, train.startStation.latitude],
        [train.endStation.longitude, train.endStation.latitude],
      ],
    },
    properties: { name: train.name },
    id: train.id,
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

function setHover(map, trainId) {
  map.setFeatureState({ source: "trains", id: trainId }, { hover: true });
}

function setNoHover(map, trainId) {
  map.setFeatureState({ source: "trains", id: trainId }, { hover: false });
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

function displayRouteOnMap(map, route) {
  const cityMarkers = route.connectingStations.map(stationToGeojson);
  addToMap(map, "cityMarkers", asGeojsonFeatureCollection(cityMarkers));

  const trains = route.trains.map(trainToGeojson);
  addToMap(map, "trains", asGeojsonFeatureCollection(trains));

  map.on("mousemove", "trains", (e) => {
    if (e.features.length > 0) {
      const newHoveredTrainId = e.features[0].id;

      if (hoveredTrainId && hoveredTrainId !== newHoveredTrainId)
        setNoHover(map, hoveredTrainId);

      hoveredTrainId = newHoveredTrainId;
      setHover(map, hoveredTrainId);

      const calenderRoute = document.getElementById(`route${hoveredTrainId}`);
      if (calenderRoute) calenderRoute.classList.add("routeSelected");
    }
  });

  map.on("mouseleave", "trains", (e) => {
    if (hoveredTrainId) setNoHover(map, hoveredTrainId);

    const calenderRoute = document.getElementById(`route${hoveredTrainId}`);
    if (calenderRoute) calenderRoute.classList.remove("routeSelected");
  });
}
