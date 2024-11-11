const mapStyles = {
  cities: {
    id: "cities",
    source: "cities",
    type: "symbol",
    filter: ["in", "id", "placeholder"], //filter: ["in", "id", "Hamburg", "Berlin"],
    layout: {
      "text-font": ["Stadia Semibold"],
      "text-size": {
        base: 1.4,
        stops: [
          [7, 14],
          [11, 24],
        ],
      },
      "text-field": ["get", "name"],
      "text-max-width": 8,
      "text-line-height": 1.55,
      "icon-image": "star_11",
      "text-offset": [0.4, 0],
      "icon-size": 0.8,
      "text-variable-anchor": ["left", "right"],
      visibility: "visible",
    },
    paint: {
      "text-color": "#333",
      "text-halo-width": 1.2,
      "text-halo-color": "rgba(255,255,255,0.8)",
    },
  },
  legs: {
    id: "legs",
    source: "legs",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": ["to-color", ["feature-state", "color"], "#aaa"],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        0.8,
        0.4,
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "active"], false],
        6,
        1,
      ],
    },
  },
  connections: {
    id: "connections",
    source: "connections",
    type: "line",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "red",
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1.0,
        0.6,
      ],
      "line-width": 4,
    },
  },
};
