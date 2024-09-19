let hoveredRouteId = null;

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

function stationsToGeojson(stations) {
  return {
    type: "FeatureCollection",
    features: stations.map(stationToGeojson),
  };
}

function initMap(map) {
  map.getCanvas().style.cursor = "default";
  map.setLayoutProperty("place-city", "text-field", ["get", `name:de`]);

  /* add transfer points */
  const transfers = [
    STATIONS[8000261],
    STATIONS[8098160],
    STATIONS[8300120],
    STATIONS[8300151],
    STATIONS[8300157],
    STATIONS[8300157]
  ];

  map.addSource("transfers", {
    type: "geojson",
    data: stationsToGeojson(transfers),
  });

  map.addLayer(getMapLayerStyle("transferCities", "transfers", "transfers"));

  /*map.addSource("route", {
    type: "geojson",
    data: route,
  });
  map.addSource("test", {
    type: "geojson",
    data: test,
  });
  map.addSource("stations", {
    type: "geojson",
    data: stations,
  });*/

  /*map.addLayer({
    id: "route-layer",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.4,
      ],
      "line-width": 4,
    },
  });*/

  /*map.addLayer({
    id: "route-layer",
    type: "line",
    source: "test",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.4,
      ],
      "line-width": 4,
    },
  });*/

  /*map.addLayer({
    id: "stations-layer",
    type: "circle",
    source: "stations",
    paint: {
      "circle-color": "green",
      "circle-radius": 5,
      "circle-opacity": 0.5,
    },
  });*/

  /*map.on("mousemove", "route-layer", (e) => {
    if (e.features.length > 0) {
      hoveredRouteId = e.features[0].id;
      map.setFeatureState(
        { source: "route", id: hoveredRouteId },
        { hover: true },
      );

      const calenderRoute = document.getElementById(`route${hoveredRouteId}`);
      if (calenderRoute) calenderRoute.classList.add("routeSelected");
    }
  });
  map.on("mouseleave", "route-layer", (e) => {
    if (hoveredRouteId) {
      map.setFeatureState(
        { source: "route", id: hoveredRouteId },
        { hover: false },
      );

      const calenderRoute = document.getElementById(`route${hoveredRouteId}`);
      if (calenderRoute) calenderRoute.classList.remove("routeSelected");
    }
  });

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
