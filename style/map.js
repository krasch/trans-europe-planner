const textStyle = {
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
    "text-offset": [0.4, 0],
    "text-variable-anchor": ["left", "right"],
    "icon-allow-overlap": true,
    "text-allow-overlap": false,
  },
  paint: {
    "text-halo-width": 1.2,
    "text-halo-color": "rgba(255,255,255,0.8)",
  },
};

const mapStyles = [
  // ################################
  //           edges (subLegs)
  // ################################
  {
    id: "edges",
    source: "edges",
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
        "match",
        ["feature-state", "status"],
        "active",
        6, // line width for active
        "alternative",
        6, // line width for alternative
        0, // fallback
      ],
    },
  },
  // ################################
  //           city circles
  // ################################

  {
    id: "city-circle",
    source: "cities",
    type: "symbol",
    layout: {
      "icon-image": ["get", "symbol"],
      "icon-size": 0.5,
      "icon-allow-overlap": true,
    },
    paint: {
      "icon-color": "white",
      "icon-opacity": 0.6,
      "icon-halo-color": ["to-color", ["feature-state", "symbolColor"], "#aaa"],
      "icon-halo-width": 1,
    },
  },

  // ################################
  //           city names
  // ################################
  {
    id: "city-name",
    source: "cities",
    type: "symbol",
    filter: [
      "any",
      // important hubs: rank = 2
      // transfers: rank = 3
      [">", ["get", "rank"], 1],
      // other cities only visible in higher zoom levels
      [">=", ["zoom"], 5],
    ],
    symbolSortKey: ["get", "rank"],
    paint: textStyle.paint,
    layout: textStyle.layout,
  },
];
