import {
  StateDict,
  MouseEventHelper,
  filterChanges,
  groupChangesById,
} from "./util.js";

function initJourneyMenu(id, journey, lngLat) {
  const element = createElementFromTemplate("template-edge-menu", {
    $root$: { "data-journey-id": id },
    ".from": { innerText: journey.from },
    ".to": { innerText: journey.to },
    ".travel-time": { innerText: journey.travelTime },
    ".via": { innerText: journey.via },
    ".num-transfer": { innerText: journey.numTransfer },
  });

  const popup = new maplibregl.Popup({
    anchor: "left",
    offset: [5, 0],
    closeButton: true,
  });
  popup.setDOMContent(element).setLngLat(lngLat);

  return popup;
}

export class Edges {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
    menuClick: () => {},
  };

  #source = "edges";
  #layers = ["edges-interact"];
  #eventPrioLayers = ["city-circle-interact"];

  #keys = {
    featureState: ["hover", "isVisible", "isActive", "color", "leg", "journey"],
  };
  #resetKeys = ["leg", "journey", "isVisible", "color", "isActive"];

  #map;
  #geo; // {id: {name: , lngLat: }}

  #state;
  #journeyMenu;

  constructor(map, geo, initialState) {
    this.#map = map;
    this.#geo = geo;

    this.#state = new StateDict(this.#resetKeys);

    const events = new MouseEventHelper(
      this.#map,
      this.#layers,
      this.#eventPrioLayers,
    );

    events.on("mouseOver", (id, lngLat) => {
      this.#map.getCanvas().style.cursor = "pointer";
      this.#callbacks["mouseOver"](id);
    });

    events.on("mouseLeave", (id, lngLat, hasHigherPriorityFeature = false) => {
      if (!hasHigherPriorityFeature)
        this.#map.getCanvas().style.cursor = "default";
      this.#callbacks["mouseLeave"](id);
    });

    events.on("click", (id, lngLat) => {
      this.#callbacks["click"](id, lngLat);
    });

    this.#map._container.addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;

      const container = e.target.parentElement.parentElement.parentElement;
      if (!container.classList.contains("edge-menu")) return;

      this.#hideJourneyMenu();
      this.#callbacks["menuClick"](container.dataset.journeyId, e.target.value);
    });

    // initial drawing
    this.update(initialState);
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }
  update(updates) {
    // apply update to the state
    // changes contains the "true" changes, i.e. things that actually changed
    const changes = this.#state.update(updates);
    this.#updateFeatureState(changes);
  }

  setHover(id, state) {
    this.#state.set(id, "hover", state);
    this.#copyStateToFeatureState(id);
  }

  getState(id, key) {
    return this.#state.get(id, key); // temporary
  }

  showJourneyMenu(journeyId, journeyInfo, lngLat) {
    if (this.#journeyMenu) this.#journeyMenu.remove();
    this.#journeyMenu = initJourneyMenu(journeyId, journeyInfo, lngLat);
    this.#journeyMenu.addTo(this.#map);
  }

  #hideJourneyMenu() {
    if (this.#journeyMenu) {
      this.#journeyMenu.remove();
      this.#journeyMenu = null;
    }
  }

  #updateFeatureState(changes) {
    const filtered = filterChanges(changes, this.#keys.featureState);
    const grouped = groupChangesById(filtered);

    for (let id in grouped) this.#copyStateToFeatureState(id);
  }

  #copyStateToFeatureState(id) {
    const current = this.#state.getAll(id, this.#keys.featureState);
    this.#map.setFeatureState({ source: this.#source, id: id }, current);
  }
}
