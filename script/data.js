const coordinates = {
    "Berlin": [13.408333, 52.518611],
    "München": [11.574444, 48.139722],
    "Verona": [10.99338, 45.43869],
    "Livorno": [10.314722, 43.55],
    "Bastia": [9.449722, 42.7]
};

const connections = [
    {
        icon: "images/train.svg",
        trainNumber: "ICE505",
        startDate: new Date("2023-10-16"),
        startTime: "8:29",
        startStation: "Berlin Hbf",
        endTime: "13:02",
        endStation: "München Hbf",
    },
    {
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

