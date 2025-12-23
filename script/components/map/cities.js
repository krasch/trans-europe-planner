import {
  MouseEventHelper,
  StateDict,
  filterChanges,
  groupChangesById,
  updateSourceData,
} from "./util.js";

export class Cities {
  #callbacks = {
    mouseOver: (cityId) => {},
    mouseLeave: (cityId) => {},
    click: (cityId) => {},
    menuClick: (cityId, menuOption) => {},
  };

  #source = "cities";
  #layers = ["city-name", "city-circle-interact"];

  #keys = {
    featureState: [
      "hover",
      // todo this is isStop||isDestination and is used in event handling, can replace?
      // somehow it does not work correctly when using in layer filter, old stops still visible, something to do with reset?
      "isVisible",
      "isDestination",
      "isStop",
      "isTransfer",
      "circleColor",
    ],
    cityMenu: ["isDestination", "isStop", "isTransfer"],
    sourceData: ["rank", "isDestination", "isStop"], // slow to update
  };
  #resetKeys = ["isStop", "isTransfer", "circleColor"];

  #map;
  #geo; // {id: {name: , lngLat: }}

  #state;
  #homeMarkers = {};
  #menus = {};

  #pulsars = null;

  constructor(map) {
    this.#map = map;
    this.#state = new StateDict(this.#resetKeys);

    const events = new MouseEventHelper(this.#map, this.#layers);

    events.on("mouseOver", (id, lngLat) => {
      this.#map.getCanvas().style.cursor = "pointer";
      this.#stopAnimation();
      this.setHover(id, true);
      this.#callbacks["mouseOver"](id);
    });

    events.on("mouseLeave", (id, lngLat) => {
      this.#map.getCanvas().style.cursor = "default";
      this.setHover(id, false);
      this.#callbacks["mouseLeave"](id);
    });

    events.on("click", (id, lngLat) => {
      this.#showCityMenu(id);
      this.#callbacks["click"](id);
    });

    this.#map._container.addEventListener("click", (e) => {
      const closest = e.target.closest("button");
      if (!closest) return;

      const container = closest.closest(".city-menu");
      if (!container) return;

      const id = container.dataset.cityId;
      this.#hideCityMenu(id);
      this.#callbacks["menuClick"](id, closest.value);
    });

    // todo why do we have this?
    this.#map._container.addEventListener("click", (e) => {
      if (!e.target.classList.contains("city-marker-home")) return;

      const id = e.target.dataset.cityId;
      this.#showCityMenu(id);
      this.#callbacks["click"](id);
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  update(updates) {
    // apply update to the state
    // changes contains the "true" changes, i.e. things that actually changed
    const changes = this.#state.update(updates);

    this.#updateFeatureState(changes);
    this.#updateSourceData(changes);

    for (let change of changes) {
      if (change.key === "isHome")
        this.#updateHomeMarker(change.id, change.value);
    }
  }

  setHover(id, state) {
    this.#state.set(id, "hover", state);
    this.#copyStateToFeatureState(id);
  }

  #updateFeatureState(changes) {
    const filtered = filterChanges(changes, this.#keys.featureState);
    const grouped = groupChangesById(filtered);

    for (let id in grouped) this.#copyStateToFeatureState(id);
  }

  #updateSourceData(changes) {
    const filtered = filterChanges(changes, this.#keys.sourceData);
    const grouped = groupChangesById(filtered);
    updateSourceData(this.#map, this.#source, grouped);
  }

  #updateHomeMarker(id, isHome) {
    if (isHome && !this.#homeMarkers[id]) {
      this.#homeMarkers[id] = initHomeMarker(id, this.#geo[id].lngLat);
      this.#homeMarkers[id].addTo(this.#map);
    }

    if (!isHome && this.#homeMarkers[id]) {
      this.#homeMarkers[id].remove();
      delete this.#homeMarkers[id];
    }
  }

  #copyStateToFeatureState(id) {
    const current = this.#state.getAll(id, this.#keys.featureState);
    this.#map.setFeatureState({ source: this.#source, id: id }, current);
  }

  #showCityMenu(id) {
    if (!this.#menus[id]) {
      this.#menus[id] = initCityMenu(
        id,
        this.#geo[id].name,
        this.#state.get(id, "numTransfer"),
        this.#geo[id].lngLat,
      );
    }

    const current = this.#state.getAll(id, this.#keys.cityMenu);
    this.#menus[id].updateElement(current);
    this.#menus[id].addTo(this.#map);
  }

  #hideCityMenu(id) {
    this.#menus[id].remove();
  }

  #stopAnimation() {
    if (this.#pulsars) {
      for (let p of this.#pulsars) p.remove();
    }
  }
}
