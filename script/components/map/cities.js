import {
  StateDict,
  MouseEventHelper,
  animateDropWithBounce,
  filterChanges,
  groupChangesById,
  updateSourceData,
  updateVisibility,
} from "./util.js";
import { createElementFromTemplate } from "../../util.js";

function initHomeMarker(id, lngLat) {
  const element = createElementFromTemplate("template-city-marker-home", {
    $root$: { "data-city-id": id },
  });

  const marker = new maplibregl.Marker({
    element: element,
    anchor: "bottom",
  });
  marker.setLngLat(lngLat);
  return marker;
}

function initDestinationMarker(lngLat) {
  const marker = new maplibregl.Marker({
    element: createElementFromTemplate("template-city-marker-destination"),
    anchor: "bottom",
  });
  marker.setLngLat(lngLat);
  return marker;
}

function initCityMenu(id, name, numTransfer, lngLat) {
  const data = {
    $root$: { "data-city-id": id },
    h3: { innerText: name },
    ".count": { innerText: numTransfer },
  };

  const element = createElementFromTemplate("template-city-menu", data);

  const textNumTransfers = element.querySelector(".num-transfers");
  const buttonShowRoutes = element.querySelector("button[value='showRoutes']");
  const buttonMakeCut = element.querySelector("button[value='makeCut']");

  // choose which text will be shown
  if (numTransfer === 0) textNumTransfers.classList.add("transfers0");
  else if (numTransfer === 1) textNumTransfers.classList.add("transfers1");
  else textNumTransfers.classList.add("transfersX");

  const popup = new maplibregl.Popup({
    anchor: "left",
    offset: [5, 0],
    closeButton: true,
  });
  popup.setDOMContent(element).setLngLat(lngLat);

  popup.updateElement = (state) => {
    if (state.isDestination !== undefined) {
      updateVisibility(buttonShowRoutes.parentElement, state.isDestination);
      updateVisibility(textNumTransfers.parentElement, state.isDestination);
    }
    if (state.isTransfer !== undefined && state.isStop !== undefined) {
      //updateVisibility(buttonMakeCut, state.isStop && !state.isTransfer);
    }
  };

  return popup;
}

function showStartAnimation(map, geo, initialState, animationDoneCallback) {
  const homeMarkers = [];
  const destinationMarkers = [];

  for (let id in initialState) {
    if (initialState[id].isHome)
      homeMarkers.push(initHomeMarker(id, geo[id].lngLat));
    if (initialState[id].isDestination)
      destinationMarkers.push(initDestinationMarker(geo[id].lngLat));
  }

  //this is the second animation we'll do (show destination markers dropping)
  const animateDestinations = () =>
    animateDropWithBounce(
      map,
      destinationMarkers,
      200,
      3,
      () => animationDoneCallback(destinationMarkers), // when animation is done callback to main
    );

  // run the first animation (show home marker(s) dropping)
  animateDropWithBounce(
    map,
    homeMarkers,
    300,
    3,
    animateDestinations, // when that is done do the second animation
  );
}

const ANIMATION = true;

export class Cities {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
    menuClick: () => {},
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

  constructor(map, geo, initialState) {
    this.#map = map;
    this.#geo = geo;

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

    this.#map._container.addEventListener("click", (e) => {
      if (!e.target.classList.contains("city-marker-home")) return;

      const id = e.target.dataset.cityId;
      this.#showCityMenu(id);
      this.#callbacks["click"](id);
    });

    // initial drawing
    if (ANIMATION) {
      showStartAnimation(this.#map, geo, initialState, (pulsars) => {
        this.#pulsars = pulsars;
        this.update(initialState);
      });
    } else {
      this.update(initialState);
    }
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
