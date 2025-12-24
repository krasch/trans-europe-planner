const CONFIG = {
  stopRadius: 4.0,
  stopStroke: 1.0,
  stopOpacity: 0.6,
  specialStopRadius: 6.0,
  specialStopStroke: 3.0,
  specialStopOpacity: 1.0,
  stopInteractRadius: 10.0,
  stopHoverOffset: 4.0,
  stopHoverStroke: 2.0,
};

export const mapLayers = [
  // ###########################################################################
  //           edges
  // ###########################################################################
  // extra wide line to allow users to interact with edges even when not hovering directly over them
  {
    id: "edges-interact",
    source: "edges",
    type: "line",
    paint: {
      "line-opacity": 0.0,
      "line-width": 20,
    },
  },
  // additional border to highlight the line when hovering
  {
    id: "edges-border",
    source: "edges",
    type: "line",
    layout: {
      "line-join": "miter",
    },
    paint: {
      "line-color": ["feature-state", "color"],
      "line-width": 2,
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "isHover"], false],
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
      "line-color": ["feature-state", "color"],
      "line-opacity": [
        "case",
        ["boolean", ["feature-state", "isActive"], false],
        0.6,
        0.4,
      ],
      "line-width": 8,
    },
  },

  // ###########################################################################
  //           stops
  // ###########################################################################
  // extra large circle to allow users to interact with circles even when not hovering directly over them
  {
    id: "stops-interact",
    source: "stops",
    type: "circle",
    paint: {
      "circle-radius": CONFIG.stopInteractRadius,
      "circle-opacity": 0,
    },
  },
  // border that lights up when hovering over a stop
  {
    id: "stops-hover-border",
    source: "stops",
    type: "circle",
    paint: {
      "circle-radius": [
        "case",
        [
          "all",
          [
            "any",
            ["boolean", ["feature-state", "isHome"], false],
            ["boolean", ["feature-state", "isDestination"], false],
            ["boolean", ["feature-state", "isTransfer"], false],
          ],
          ["boolean", ["feature-state", "isHover"], false],
        ],
        CONFIG.specialStopRadius + CONFIG.stopHoverOffset,
        ["boolean", ["feature-state", "isHover"], false],
        CONFIG.stopRadius + CONFIG.stopHoverOffset,
        0,
      ],
      "circle-opacity": 0,
      "circle-stroke-width": [
        "case",
        ["boolean", ["feature-state", "isHover"], false],
        CONFIG.stopHoverStroke,
        0,
      ],
      "circle-stroke-color": ["feature-state", "color"],
    },
  },
  // the actual stop circles
  {
    id: "stops",
    source: "stops",
    type: "circle",
    paint: {
      "circle-radius": [
        "case",
        [
          "any",
          ["boolean", ["feature-state", "isHome"], false],
          ["boolean", ["feature-state", "isDestination"], false],
          ["boolean", ["feature-state", "isTransfer"], false],
        ],
        CONFIG.specialStopRadius,
        CONFIG.stopRadius,
      ],
      "circle-color": "white",
      "circle-opacity": [
        "case",
        [
          "any",
          ["boolean", ["feature-state", "isHome"], false],
          ["boolean", ["feature-state", "isDestination"], false],
          ["boolean", ["feature-state", "isTransfer"], false],
        ],
        CONFIG.specialStopOpacity,
        CONFIG.stopOpacity,
      ],
      "circle-stroke-width": [
        "case",
        [
          "any",
          ["boolean", ["feature-state", "isHome"], false],
          ["boolean", ["feature-state", "isDestination"], false],
        ],
        CONFIG.specialStopStroke,
        CONFIG.stopStroke,
      ],
      "circle-stroke-color": ["feature-state", "color"],
    },
  },
  // ###########################################################################
  //           stop names
  // ###########################################################################
  /*{
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
  },*/
];
