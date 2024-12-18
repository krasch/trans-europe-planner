function cityToGeojson(data) {
  const [id, city] = data;

  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: city.lngLat,
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: {
      id: id,
      name: city.name,
    },
  };
}

function edgeToGeojson(data) {
  const [id, edge] = data;

  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [edge.startLngLat, edge.endLngLat],
    },
    // use this instead of outer-level 'id' field because those ids must be numeric
    properties: { id: id },
  };
}

function asGeojsonFeatureCollection(features) {
  return {
    type: "FeatureCollection",
    features: features,
  };
}

// this class abstracts away following issues
// 1. We want to react on multiple layers (e.g. all city layers) with the same event handlers
// 2. The maplibre mouseLeave event does not contain the feature that was left -> need to keep state
// 3. Maplibre does not attach the feature state to the event
class MouseEventHelper {
  #states;

  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
  };

  constructor(map, states, layerNames) {
    this.#states = states;

    let currentFeature = null;

    const mouseOver = (layer, e) => {
      // only concerned with currently visible features
      const visible = e.features.filter((f) =>
        this.#states.get(f.id, "isVisible"),
      );
      if (visible.length === 0) return;

      // todo currently only looking at first feature, is that a problem?
      const newFeature = visible[0];

      // no changes
      if (currentFeature && newFeature.id === currentFeature.id) return;

      currentFeature = newFeature;
      this.#callbacks["mouseOver"](newFeature.id, e.lngLat);
    };

    const mouseLeave = (layer, e) => {
      if (currentFeature) {
        this.#callbacks["mouseLeave"](currentFeature.id, e.lngLat);
        currentFeature = null;
      }
    };

    const click = (layer, e) => {
      if (currentFeature) this.#callbacks["click"](currentFeature.id, e.lngLat);
    };

    for (let layer of layerNames) {
      map.on("mouseover", layer, (e) => mouseOver(layer, e));
      map.on("mouseleave", layer, (e) => mouseLeave(layer, e));
      map.on("click", layer, (e) => click(layer, e));
    }
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }
}

class MapWrapper {
  #callbacks = {
    selectJourney: () => {},
    showCityRoutes: () => {},
    hideCityRoutes: () => {},
  };

  #states;
  #objects;
  #observedKeys;

  #journeyMenu;
  #cityTooltip;
  #journeys;
  #mapping;

  constructor(containerId, center, zoom) {
    this.map = new maplibregl.Map({
      container: containerId,
      style: "style/map/outdoors-modified.json",
      center: center,
      zoom: zoom,
    });
  }

  async load(cities, legs) {
    return new Promise((fulfilled, rejected) => {
      this.map.on("load", async () => {
        try {
          const image = await this.map.loadImage("images/circle.sdf.png");
          this.map.addImage("circle", image.data, { sdf: true });

          this.init(cities, legs);
          fulfilled();
        } catch (error) {
          rejected(error);
        }
      });
    });
  }

  init(data) {
    this.map.getCanvas().style.cursor = "default";

    const [cities, edges] = data;

    // add cities and legs sources
    this.map.addSource("cities", {
      type: "geojson",
      data: asGeojsonFeatureCollection(
        Object.entries(cities.geo).map(cityToGeojson),
      ),
      promoteId: "id", // otherwise can not use non-numeric ids
    });
    this.map.addSource("edges", {
      type: "geojson",
      data: asGeojsonFeatureCollection(
        Object.entries(edges.geo).map(edgeToGeojson),
      ),
      promoteId: "id", // otherwise can not use non-numeric ids
    });

    // add all layers
    for (let layer of mapStyles) this.map.addLayer(layer);

    // this will keep track of states
    this.#states = {
      cities: new StateManager(cities.defaults),
      edges: new StateManager(edges.defaults),
    };

    // all the bits and pieces shown on the map
    // all the things below must have an update() method
    this.#objects = {
      // cities
      cityMarkers: new CityMarkerCollection(cities.geo),
      cityMenus: new CityMenuCollection(cities.geo),
      citySourceData: new MapSourceDataUpdater("cities"),
      cityFeatureState: new FeatureStateUpdater("cities"),
      // edges
      edgeFeatureState: new FeatureStateUpdater("edges"),
    };

    // which keys of the state do the map objects listen to
    // must have one entry for every entry in this.#mapObjects
    // only updates concerning these keys will be sent to the update() method
    this.#observedKeys = {
      // cities
      cityMarkers: ["isHome"],
      cityMenus: ["isDestination"],
      citySourceData: ["rank", "isVisible"], // slow to update
      cityFeatureState: ["isVisible", "circleColor", "isDestination", "isStop"],
      // edges
      edgeFeatureState: ["isVisible", "isActive", "color", "leg", "journey"],
    };

    const initialCityDiffs = this.#states.cities.setToDefaults();
    const initialEdgeDiffs = this.#states.edges.setToDefaults();

    this.#showStartAnimation(cities.geo, initialCityDiffs, (pulsars) => {
      // when animation is done, do proper initial render
      this.#updateCities(initialCityDiffs);
      this.#updateEdges(initialEdgeDiffs);

      this.#setupEventHandlers(pulsars);
    });
  }

  #setupEventHandlers(pulsars) {
    let pulsarsRemoved = false;

    // initialise mouse event helper for cities and edge layers
    const layerMouseEvents = {
      cities: new MouseEventHelper(this.map, this.#states.cities, [
        "city-name",
        "city-circle-interact",
      ]),
      edges: new MouseEventHelper(this.map, this.#states.edges, [
        "edges-interact",
      ]),
    };

    // when clicking on city marker popup should show
    this.#objects.cityMarkers.setPopups(this.#objects.cityMenus);

    // when hovering over city circle a small tooltip should show up
    this.#cityTooltip = new maplibregl.Popup({ closeButton: false });

    // set up mouse events for interacting with cities
    layerMouseEvents.cities.on("mouseOver", (id, lngLat) => {
      this.map.getCanvas().style.cursor = "pointer";
      this.setCityHoverState(id, true);
      /*this.#cityTooltip
        .setLngLat(e.lngLat)
        .setText(e.feature.properties.name)
        .addTo(this.map);*/
    });
    layerMouseEvents.cities.on("mouseLeave", (id, lngLat) => {
      this.map.getCanvas().style.cursor = "default";
      this.setCityHoverState(id, false);
      //this.#cityTooltip.remove();
    });
    layerMouseEvents.cities.on("click", (id, lngLat) => {
      if (!pulsarsRemoved) {
        for (let p of pulsars) p.remove();
        pulsarsRemoved = true;
      }
      // when clicking on city name, popup should show
      this.#objects.cityMenus.show(this.map, id);
    });

    // set up mouse events for interacting with edges
    layerMouseEvents.edges.on("mouseOver", (id, lngLat) => {
      this.map.getCanvas().style.cursor = "pointer";
      const journey = this.#states.edges.get(id, "journey");
      this.setJourneyHoverState(journey, true);
    });
    layerMouseEvents.edges.on("mouseLeave", (id, lngLat) => {
      this.map.getCanvas().style.cursor = "default";
      const journey = this.#states.edges.get(id, "journey");
      this.setJourneyHoverState(journey, false);
    });
    layerMouseEvents.edges.on("click", (id, lngLat) => {
      const journey = this.#states.edges.get(id, "journey");
      const active = this.#states.edges.get(id, "active");

      if (!active) this.#callbacks["selectJourney"](journey);

      // todo don't re-instantiate every time
      if (this.#journeyMenu) this.#journeyMenu.remove();
      this.#journeyMenu = new JourneyMenu(
        journey,
        this.#journeys[journey],
        lngLat,
      );
      this.#journeyMenu.popup.addTo(this.map);
    });

    // set up menu events
    this.map._container.addEventListener("change", (e) => {
      const data = e.target.data;

      // show/hide routes for a city
      if (data.type === "city" && data.entry === "routes") {
        this.#objects.cityMenus.hide(data.cityId);

        if (e.target.checked) this.#callbacks["showCityRoutes"](data.cityName);
        else this.#callbacks["hideCityRoutes"](data.cityName);
      }
    });
  }

  #showStartAnimation(geo, cityDiffs, animationDoneCallback) {
    const homeMarkers = cityDiffs
      .filter((d) => d.key === "isHome" && d.newValue)
      .map((d) => initHomeMarker(geo[d.id].lngLat));

    const destinationMarkers = cityDiffs
      .filter((d) => d.key === "isDestination" && d.newValue)
      .map((d) => initDestinationMarker(geo[d.id].lngLat));

    //this is the second animation we'll do (show destination markers dropping)
    const animateDestinations = () =>
      animateDropWithBounce(
        this.map,
        destinationMarkers,
        200,
        3,
        () => animationDoneCallback(destinationMarkers), // when animation is done callback to main
      );

    // run the first animation (show home marker(s) dropping)
    animateDropWithBounce(
      this.map,
      homeMarkers,
      300,
      3,
      animateDestinations, // when that is done do the second animation
    );
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {
    const [cities, edges, journeys] = data;

    const cityDiffs = this.#states.cities.update(cities);
    this.#updateCities(cityDiffs);

    const edgeDiffs = this.#states.edges.update(edges.state);
    this.#updateEdges(edgeDiffs);

    this.#journeys = journeys;
    this.#mapping = {
      edges: edges.mapping,
    };
  }

  #updateCities(cityDiffs) {
    const toUpdate = [
      "cityMarkers",
      "cityMenus",
      "citySourceData",
      "cityFeatureState",
    ];

    for (let name of toUpdate) {
      const filtered = filterDiffs(cityDiffs, this.#observedKeys[name]);
      this.#objects[name].update(this.map, filtered);
    }
  }

  #updateEdges(edgeDiffs) {
    const toUpdate = ["edgeFeatureState"];
    for (let name of toUpdate) {
      const filtered = filterDiffs(edgeDiffs, this.#observedKeys[name]);
      this.#objects[name].update(this.map, filtered);
    }
  }

  setLegHoverState(leg, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].legs.includes(leg))
        this.#objects.edgeFeatureState.set(this.map, id, "hover", state);
    }
  }

  setJourneyHoverState(journey, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].journeys.includes(journey))
        this.#objects.edgeFeatureState.set(this.map, id, "hover", state);
    }
  }

  setCityHoverState(cityId, state) {
    this.#objects.cityFeatureState.set(this.map, cityId, "hover", state);
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.cityToGeojson = cityToGeojson;
  module.exports.legToGeojson = edgeToGeojson;
}
