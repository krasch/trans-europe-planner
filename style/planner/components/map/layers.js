const mapStyles = [
  // ################################
  //           edges (subLegs)
  // ################################
  // extra wide line to allow users to interact with edges even when not hovering directly over them
  {
    id: "edges-interact",
    source: "edges",
    type: "line",
    paint: {
      "line-opacity": 0.0,
      "line-width": [
        "case",
        ["boolean", ["feature-state", "isVisible"], false],
        20,
        0,
      ],
    },
  },
  // additional border to highlight the line when hovering
  {
    id: "edges-border",
    source: "edges",
    type: "line",
    layout: {
      "line-join": "miter",
      //"line-cap": "round",
    },
    paint: {
      "line-color": ["to-color", ["feature-state", "color"], "#aaa"],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "isVisible"], false],
        2,
        0,
      ],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1.0,
        0.0,
      ],
      "line-gap-width": 4, // -> line center is not highlighted
    },
  },
  // the actual lines
  {
    id: "edges",
    source: "edges",
    type: "line",
    layout: {
      "line-join": "miter",
    },
    paint: {
      "line-color": ["to-color", ["feature-state", "color"], "#aaa"],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "isActive"], false],
        0.6,
        0.4,
      ],
      "line-width": [
        "case",
        ["boolean", ["feature-state", "isVisible"], false],
        8,
        0,
      ],
    },
  },
  // ################################
  //           city circles
  // ################################
  {
    id: "city-circle-interact",
    source: "cities",
    type: "symbol",
    filter: [
      "any",
      ["boolean", ["get", "isDestination"], false],
      ["boolean", ["get", "isStop"], false],
    ],
    layout: {
      "icon-image": "circle",
      "icon-size": 0.6,
      "icon-allow-overlap": true,
      "text-allow-overlap": true, // perhaps speed up redrawing?
    },
    paint: {
      "icon-color": "white",
      "icon-opacity": 0.0,
    },
  },
  {
    id: "city-circle-hover-border",
    source: "cities",
    type: "circle",
    paint: {
      "circle-radius": [
        "case",
        [
          "all",
          ["boolean", ["feature-state", "isDestination"], false],
          ["boolean", ["feature-state", "hover"], false],
        ],
        8.0,
        [
          "all",
          ["boolean", ["feature-state", "isStop"], false],
          ["boolean", ["feature-state", "hover"], false],
        ],
        6.0,
        0,
      ],
      "circle-opacity": 0,
      "circle-stroke-width": [
        "case",
        [
          "all",
          ["boolean", ["feature-state", "isDestination"], false],
          ["boolean", ["feature-state", "hover"], false],
        ],
        2,
        [
          "all",
          ["boolean", ["feature-state", "isStop"], false],
          ["boolean", ["feature-state", "hover"], false],
        ],
        2,
        0,
      ],
      "circle-stroke-color": [
        "to-color",
        ["feature-state", "circleColor"],
        "#aaa",
      ],
    },
  },
  {
    id: "city-circle",
    source: "cities",
    type: "circle",
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "isDestination"], false],
        5.0,
        ["boolean", ["feature-state", "isStop"], false],
        3.0,
        0,
      ],
      "circle-color": "white",
      "circle-opacity": [
        "case",
        ["boolean", ["feature-state", "isDestination"], false],
        1.0,
        ["boolean", ["feature-state", "isStop"], false],
        0.6,
        0,
      ],
      "circle-stroke-width": [
        "case",
        ["boolean", ["feature-state", "isDestination"], false],
        1,
        ["boolean", ["feature-state", "isStop"], false],
        1,
        0,
      ],
      "circle-stroke-color": [
        "to-color",
        ["feature-state", "circleColor"],
        "#aaa",
      ],
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
      // important hubs always shown
      [">", ["get", "rank"], 1],
      // other cities only visible in higher zoom levels
      [">=", ["zoom"], 5],
    ],
    symbolSortKey: ["get", "rank"],
    layout: {
      "text-font": ["Stadia Semibold"],
      "text-size": {
        base: 1.2,
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
      "text-halo-width": 0.8,
      "text-color": "#666",
      "text-halo-color": "rgba(255,255,255,0.8)",
    },
  },
];
