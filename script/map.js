const coordinates = {
    "Berlin": [13.408333, 52.518611],
    "München": [11.574444, 48.139722],
    "Verona": [10.99338, 45.43869],
    "Livorno": [10.314722, 43.55],
    "Bastia": [9.449722, 42.7]
}

let hoveredRouteId = null;

function initMap(map){
    map.getCanvas().style.cursor = 'default';

    map.setLayoutProperty('place-city-capital', 'text-field', ['get', `name:de`]);
    map.setLayoutProperty('place-city', 'text-field', ['get', `name:de`]);

    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["Berlin"],
                    coordinates["München"],
                    coordinates["Verona"],
                    coordinates["Livorno"],
                    coordinates["Bastia"],
                ]
            },
            "id": 1 // must be numeric
        }
    });
    map.addSource('stations', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates["Berlin"]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates["München"]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates["Verona"]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates["Livorno"]
                    }
                },
                {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': coordinates["Bastia"]
                    }
                },
            ]
        }
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
                1,
                0.5
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
            hoveredRouteId = e.features[0].id
            map.setFeatureState(
                {source: 'route', id: hoveredRouteId},
                {hover: true}
            );
        }
    });
    map.on('mouseleave', 'route-layer', (e) => {
        if (hoveredRouteId) {
            map.setFeatureState(
                {source: 'route', id: hoveredRouteId},
                {hover: false}
            );
        }
    });

    const popup = new maplibregl.Popup({
        closeButton: true,
        closeOnClick: true
    });

    map.on('mouseenter', 'route-layer', (e) => {
        popup.setLngLat(e.lngLat).setHTML("test").addTo(map);
    });

    /*map.on('mouseleave', 'route-layer', () => {
      popup.remove();
    });*/
}