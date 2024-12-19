function initHomeMarker(lngLat) {
  const marker = new maplibregl.Marker({
    element: createElementFromTemplate("template-city-marker-home"),
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

class CityMarker {
  marker; // the actual maplibre marker object

  constructor(lngLat) {
    this.marker = initHomeMarker(lngLat);
  }

  update(diff) {
    // nothing to update
  }
}

class CityMarkerCollection {
  markers = {};

  constructor(cities) {
    for (let id in cities) {
      this.markers[id] = new CityMarker(cities[id].lngLat);
    }
  }

  update(map, diffs) {
    for (let diff of diffs) {
      this.markers[diff.id].update(diff);

      if (diff.kind === "added" && diff.newValue)
        this.markers[diff.id].marker.addTo(map);

      // todo why are getting remove events at the begging of map rendering?
      if (diff.kind === "removed") this.markers[diff.id].marker.remove();
    }
  }

  setPopups(popups) {
    for (let id in this.markers) {
      // todo this has too much knowledge of the other object
      if (this.markers[id].marker)
        this.markers[id].marker.setPopup(popups.popups[id].popup);
    }
  }
}

class CityMenu {
  #popupElement; // the html element
  popup; // the actual maplibre popup object

  // input elements to make it easier to change menu items
  #entries = {};

  constructor(id, name, lngLat) {
    this.#popupElement = createElementFromTemplate("template-city-menu", {
      ".title": { innerText: name },
    });
    this.#popupElement.id = `city-menu-${id}`;

    for (let entryContainer of this.#popupElement.querySelectorAll(
      ".menu-entry",
    )) {
      const entryName = this.#initMenuEntry(entryContainer, id, name);
      this.#entries[entryName] = entryContainer;
    }

    this.popup = new maplibregl.Popup({
      anchor: "left",
      offset: [5, -20],
      closeButton: false,
    });

    this.popup.setDOMContent(this.#popupElement).setLngLat(lngLat);
  }

  update(diff) {
    if (diff.key === "isDestination") {
      if (diff.newValue === true)
        this.#entries["routes"].style.setProperty("display", "flex");
      else this.#entries["routes"].style.setProperty("display", "none");
    }
  }

  #initMenuEntry(element, cityId, cityName) {
    const result = initInputAndLabel(element, cityId);

    // needed for reacting when entry is chosen
    result.input.data = {
      type: "city",
      cityName: cityName,
      cityId: cityId,
      entry: result.input.value,
    };

    return result.input.value; // what is the "name" of this entry?
  }
}

class JourneyMenu {
  #popupElement; // the html element
  popup; // the actual maplibre popup object

  // input elements to make it easier to change menu items
  #entries = {};

  constructor(id, journey, lngLat) {
    this.#popupElement = createElementFromTemplate("template-edge-menu", {
      ".from": { innerText: journey.from },
      ".to": { innerText: journey.to },
      ".travel-time": { innerText: journey.travelTime },
      ".via": { innerText: journey.via },
      ".num-transfer": { innerText: journey.numTransfer },
    });
    this.#popupElement.id = `edge-menu-${id}`;

    for (let entryContainer of this.#popupElement.querySelectorAll(
      ".menu-entry",
    )) {
      const entryName = this.#initMenuEntry(entryContainer, id, name);
      this.#entries[entryName] = entryContainer;
    }

    this.popup = new maplibregl.Popup({
      anchor: "left",
      offset: [5, -20],
      closeButton: false,
    });

    this.popup.setDOMContent(this.#popupElement).setLngLat(lngLat);
  }

  update(diff) {}

  #initMenuEntry(element, id) {
    const result = initInputAndLabel(element, id);

    // needed for reacting when entry is chosen
    result.input.data = {
      type: "edge",
      id: id,
      entry: result.input.value,
    };

    return result.input.value; // what is the "name" of this entry?
  }

  remove() {
    this.popup.remove();
    this.#popupElement.remove();
  }
}

class CityMenuCollection {
  popups = {};

  constructor(cities) {
    for (let id in cities) {
      this.popups[id] = new CityMenu(id, cities[id].name, cities[id].lngLat);
    }
  }

  update(map, diffs) {
    for (let diff of diffs) {
      this.popups[diff.id].update(diff);
    }
  }

  show(map, id) {
    this.popups[id].popup.addTo(map);
  }

  hide(id) {
    this.popups[id].popup.remove();
  }
}

class MapSourceDataUpdater {
  #sourceName;

  constructor(sourceName) {
    this.#sourceName = sourceName;
  }

  update(map, diffs) {
    if (diffs.length === 0) return;

    const updates = [];

    const grouped = groupDiffsById(diffs);
    for (let id in grouped) {
      updates.push({
        id: id,
        addOrUpdateProperties: grouped[id].map((d) => ({
          key: d.key,
          value: d.newValue,
        })),
      });
    }

    if (updates.length > 0)
      map.getSource(this.#sourceName).updateData({ update: updates });
  }
}

class FeatureStateUpdater {
  #sourceName;
  #mirror = {};

  constructor(sourceName) {
    this.#sourceName = sourceName;
  }

  update(map, diffs) {
    if (diffs.length === 0) return;

    const grouped = groupDiffsById(diffs);

    for (let id in grouped) {
      let current = this.#mirror[id] ?? {};

      for (let diff of grouped[id]) {
        if (diff.kind === "updated" || diff.kind === "added")
          current[diff.key] = diff.newValue;
        else if (diff.kind === "removed") {
          current[diff.key] = null; // don't delete key because maplibre does not notice deletes
        }
      }

      map.setFeatureState({ source: this.#sourceName, id: id }, current);
      this.#mirror[id] = current;
    }
  }

  set(map, id, key, value) {
    let current = this.#mirror[id] ?? {};
    current[key] = value;

    map.setFeatureState({ source: this.#sourceName, id: id }, current);
    this.#mirror[id] = current;
  }
}
