let hoveredRouteId = null;

function initMap(map){
    map.getCanvas().style.cursor = 'default';

    map.setLayoutProperty('place-city-capital', 'text-field', ['get', `name:de`]);
    map.setLayoutProperty('place-city', 'text-field', ['get', `name:de`]);

    map.addSource('route', {
        'type': 'geojson',
        'data': route,
    });
    map.addSource('stations', {
        'type': 'geojson',
        'data': stations
    });

    map.addLayer({
        'id': 'route-layer',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': 'red',
            'line-opacity': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                0.8,
                0.4
            ],
            'line-width': 4
        }
    });
    map.addLayer({
        'id': 'stations-layer',
        'type': 'circle',
        'source': 'stations',
        'paint': {
            'circle-color': 'green',
            'circle-radius': 5,
            'circle-opacity': 0.5,
        }
    });

    map.on('mousemove', 'route-layer', (e) => {
        if (e.features.length > 0) {
            hoveredRouteId = e.features[0].id;
            map.setFeatureState(
                {source: 'route', id: hoveredRouteId},
                {hover: true}
            );

            document.getElementById(`route${hoveredRouteId}`).classList.add('routeSelected');
        }
    });
    map.on('mouseleave', 'route-layer', (e) => {
        if (hoveredRouteId) {
            map.setFeatureState(
                {source: 'route', id: hoveredRouteId},
                {hover: false}
            );
            document.getElementById(`route${hoveredRouteId}`).classList.remove('routeSelected');
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