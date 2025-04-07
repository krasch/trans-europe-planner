import { Cities } from "./cities.js";
import { Edges } from "./edges.js";

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

export class MapWrapper {
  #callbacks = {
    selectJourney: () => {},
    showCityRoutes: () => {},
    showCalendar: () => {},
  };

  #journeys;
  #mapping;

  constructor(containerId, center, zoom) {
    this.map = new maplibregl.Map({
      container: containerId,
      style: "style/planner/components/map/outdoors-modified.json",
      center: center,
      zoom: zoom,
    });
  }

  async load(cities, legs) {
    return new Promise((fulfilled, rejected) => {
      this.map.on("load", async () => {
        try {
          const image = await this.map.loadImage(
            "/images/markers/circle.sdf.png",
          );
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
    this.map.addControl(
      new maplibregl.NavigationControl({ showCompass: false, showZoom: true }),
    );

    // disable map rotation
    this.map.dragRotate.disable();
    this.map.touchZoomRotate.disableRotation();
    this.map.keyboard.disableRotation();

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

    this.cities = new Cities(this.map, cities.geo, cities.defaults);
    this.edges = new Edges(this.map, edges.geo, edges.defaults);

    this.cities.on("menuClick", (id, entry) => {
      if (entry === "showRoutes")
        this.#callbacks["showCityRoutes"](cities.geo[id].name);

      if (entry === "makeCut")
        this.#callbacks["cutJourney"](cities.geo[id].name);
    });

    this.edges.on("mouseOver", (id, lngLat) => {
      const journey = this.edges.getState(id, "journey");
      this.setJourneyHoverState(journey, true);
    });

    this.edges.on("mouseLeave", (id, lngLat) => {
      const journey = this.edges.getState(id, "journey");
      this.setJourneyHoverState(journey, false);
    });

    this.edges.on("click", (id, lngLat) => {
      const active = this.edges.getState(id, "isActive");
      const journeyId = this.edges.getState(id, "journey");

      // first click = make active
      if (!active) {
        this.#callbacks["selectJourney"](journeyId);
        return;
      }

      // second click = show menu
      //this.edges.showJourneyMenu(journeyId, this.#journeys[journeyId], lngLat);
    });

    this.edges.on("menuClick", (journeyId, entry) => {
      if (entry === "showCalendar") {
        this.#callbacks["showCalendar"](journeyId);
      }
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {
    const [cities, edges, journeys] = data;

    this.cities.update(cities);
    this.edges.update(edges.state);

    this.#journeys = journeys;
    this.#mapping = {
      edges: edges.mapping,
    };
  }

  setLegHoverState(leg, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].legs.includes(leg))
        this.edges.setHover(id, state);
    }
  }

  setJourneyHoverState(journey, state) {
    for (let id in this.#mapping.edges) {
      if (this.#mapping.edges[id].journeys.includes(journey))
        this.edges.setHover(id, state);
    }
  }
}
