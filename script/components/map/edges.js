function initEdgeMenu(id, journey, lngLat) {
  const element = createElementFromTemplate("template-edge-menu", {
    $root$: { "data-edge-id": id },
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

class Edges {
  #callbacks = {
    mouseOver: () => {},
    mouseLeave: () => {},
    click: () => {},
    menuClick: () => {},
  };

  #source = "edges";
  #layers = ["edges-interact"];
  #eventPrioLayers = ["cities-interact"];

  #keys = {
    featureState: ["hover", "isVisible", "isActive", "color", "leg", "journey"],
  };

  #map;
  #geo; // {id: {name: , lngLat: }}

  #state;
  #journeyMenu;

  constructor(map, geo, initialState) {
    this.#map = map;
    this.#geo = geo;

    this.#state = new StateDict();
    const events = new MouseEventHelper(
      this.#map,
      this.#layers,
      this.#eventPrioLayers,
    );

    events.on("mouseOver", (id, lngLat) => {
      this.#map.getCanvas().style.cursor = "pointer";
      this.#callbacks["mouseOver"](id);
    });

    events.on("mouseLeave", (id, lngLat) => {
      this.#map.getCanvas().style.cursor = "default";
      this.#callbacks["mouseLeave"](id);
    });

    events.on("click", (id, lngLat) => {
      this.#callbacks["click"](id, lngLat);
    });

    this.#map._container.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        const menu = e.target.parentElement.parentElement;
        const id = menu.dataset.edgeId;
        //this.#hideEdgeMenu(id);
        this.#callbacks["menuClick"](id, e.target.value);
      }
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

  showEdgeMenu(journeyId, journeyInfo, lngLat) {
    if (this.#journeyMenu) this.#journeyMenu.remove();
    this.#journeyMenu = initEdgeMenu(journeyId, journeyInfo, lngLat);
    this.#journeyMenu.addTo(this.#map);
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
