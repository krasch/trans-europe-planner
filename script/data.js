const coordinates = {
    "Berlin": [13.408333, 52.518611],
    "München": [11.574444, 48.139722],
    "Verona": [10.99338, 45.43869],
    "Florenz": [11.24626, 43.77925],
    "Livorno": [10.314722, 43.55],
    "Bastia": [9.449722, 42.7]
};

const connections = [
    {
        routeId: 1,
        icon: "images/train.svg",
        trainNumber: "ICE505",
        startDate: new Date("2023-10-16"),
        startTime: "8:29",
        startStation: "Berlin Hbf",
        endTime: "13:02",
        endStation: "München Hbf",
    },
    {
        routeId: 2,
        icon: "images/train.svg",
        trainNumber: "EC87",
        startDate: new Date("2023-10-16"),
        startTime: "13:34",
        startStation: "München Hbf",
        endTime: "18:58",
        endStation: "Verona PN",
    },
    /*{
        trainNumber: "FR  8503",
        startDate: new Date("2023-10-17"),
        startTime: "09:37",
        startStation: "Verona PN",
        endTime: "11:24",
        endStation: "Firenze SMN",
    }*/
    {
        routeId: 5,
        icon: "images/ferry.svg",
        trainNumber: "",
        startDate: new Date("2023-10-18"),
        startTime: "07:00",
        startStation: "Livorno",
        endTime: "11:30",
        endStation: "Bastia",
    },
];

const route = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["Berlin"],
                    coordinates["München"],
                ]
            },
            "id": 1 // must be numeric
        },
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["München"],
                    coordinates["Verona"],
                ]
            },
            "id": 2
        },
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["Verona"],
                    coordinates["Florenz"],
                ]
            },
            "id": 3
        },
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["Florenz"],
                    coordinates["Livorno"],
                ]
            },
            "id": 4
        },
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    coordinates["Livorno"],
                    coordinates["Bastia"],
                ]
            },
            "id": 5
        }
    ]
};

const stations = {
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
                'coordinates': coordinates["Florenz"]
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
};

