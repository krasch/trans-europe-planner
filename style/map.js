const cityNameBaseStyle = {
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
    "text-offset": [-0.4, 0],
    "text-anchor": "right",
    // using variable anchor means some city names might appear multiple times
    // because our style layers are not mutually exclusive
    // because can not combine feature and feature-state filters
    //"text-variable-anchor": ["left", "right"],
  },
  paint: {
    "text-color": "#333",
    "text-halo-width": 1.2,
    "text-halo-color": "rgba(255,255,255,0.8)",
  },
};

/* for city circles and names, respectively:
 - it is not possible to use feature-state in a filter
 - meaning I am manually filtering by id, set in the code
 - which makes it hard to combine this with feature-filters
 - because of that there are multiple circle/name layers
 - which is annoying because I am repeating stylings
 - and because the same item might get styled twice
 */

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

  // important hubs always visible, others only in higher zoom levels
  {
    id: "city-circle",
    source: "cities",
    filter: [
      ">=",
      ["zoom"],
      [
        "match",
        ["get", "rank"],
        1, // rank 1
        1, // minimum zoom level for rank 1
        2, // rank 2
        5, // minimum zoom level for rank 2
        23, // fallback zoom level
      ],
    ],
    type: "circle",
    paint: {
      "circle-radius": 3,
      "circle-color": "white",
      "circle-stroke-width": 1,
      "circle-stroke-color": ["to-color", ["feature-state", "color"], "#aaa"],
    },
  },

  // stops are always visible
  {
    id: "city-circle-stops",
    source: "cities",
    filter: ["in", "id", "placeholder"], // will be set in code
    type: "circle",
    paint: {
      "circle-radius": 3,
      "circle-color": "white",
      "circle-opacity": 0.4,
      "circle-stroke-width": 1,
      "circle-stroke-color": ["to-color", ["feature-state", "color"], "#aaa"],
      "circle-stroke-opacity": 0.2,
    },
  },

  // transfers are even more visible
  {
    id: "city-circle-transfers",
    source: "cities",
    filter: ["in", "id", "placeholder"], // will be set in code
    type: "circle",
    paint: {
      "circle-radius": 4,
      "circle-color": "white",
      "circle-opacity": 1.0,
      "circle-stroke-width": 2,
      "circle-stroke-color": ["to-color", ["feature-state", "color"], "#aaa"],
      "circle-stroke-opacity": 0.4,
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
      // important hubs always visible, others only in higher zoom levels
      ">=",
      ["zoom"],
      [
        "match",
        ["get", "rank"],
        1, // rank 1
        1, // minimum zoom level for rank 1
        2, // rank 2
        5, // minimum zoom level for rank 2
        23, // fallback zoom level
      ],
    ],
    layout: cityNameBaseStyle.layout,
    paint: cityNameBaseStyle.paint,
  },
  // transfer city names should always be visible
  {
    id: "city-name-transfers",
    source: "cities",
    type: "symbol",
    filter: ["in", "id", "placeholder"], // will be set in code
    minzoom: 1,
    layout: cityNameBaseStyle.layout,
    paint: cityNameBaseStyle.paint,
  },
];
