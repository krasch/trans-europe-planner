class CityMarker {
  #markerElement; // the html element
  marker; // the actual maplibre marker object
  icon;

  constructor(lngLat) {
    this.#markerElement = createElementFromTemplate("template-city-marker");

    this.marker = new maplibregl.Marker({
      element: this.#markerElement,
      anchor: "bottom",
    });
    this.marker.setLngLat(lngLat);
  }

  update(diff) {
    if (diff.key === "markerIcon") {
      this.icon = diff.newValue;

      this.#markerElement.classList.remove("city-marker-empty");
      this.#markerElement.classList.remove("city-marker-home");
      this.#markerElement.classList.remove("city-marker-destination");
      if (diff.kind === "updated" || diff.kind === "added")
        this.#markerElement.classList.add(`city-marker-${diff.newValue}`);

      return;
    }

    if (diff.key === "markerSize") {
      this.#markerElement.classList.remove("city-marker-large");
      this.#markerElement.classList.remove("city-marker-small");
      if (diff.kind === "updated" || diff.kind === "added")
        this.#markerElement.classList.add(`city-marker-${diff.newValue}`);

      return;
    }

    if (diff.key === "markerColor") {
      this.#markerElement.classList.remove("city-marker-light");
      this.#markerElement.classList.remove("city-marker-dark");
      if (diff.kind === "updated" || diff.kind === "added")
        this.#markerElement.classList.add(`city-marker-${diff.newValue}`);
    }
  }
}

class CityMarkerCollection {
  markers = {};
  added = [];

  constructor(cities) {
    for (let id in cities) {
      this.markers[id] = new CityMarker(cities[id].lngLat);
    }
  }

  update(map, diffs) {
    for (let diff of diffs) {
      this.markers[diff.id].update(diff);

      if (diff.kind === "added" && diff.key === "markerIcon") {
        this.added.push(diff.id); // not directly adding to map here
      }

      if (diff.kind === "removed" && diff.key === "markerIcon")
        this.markers[diff.id].marker.remove();
    }
  }

  addToMapWithAnimation(map) {
    const markers = this.added.map((id) => this.markers[id]);

    const animateDestinations = () =>
      animateDropWithBounce(
        map,
        markers.filter((m) => m.icon === "destination").map((m) => m.marker),
        200,
        3,
      );

    // animate all markers with a home icon
    animateDropWithBounce(
      map,
      markers.filter((m) => m.icon === "home").map((m) => m.marker),
      300,
      3,
      animateDestinations, // when that is done animate all with a destination marker
    );
  }

  setPopups(popups) {
    for (let id in this.markers) {
      // todo this has too much knowledge of the other object
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
    if (diff.key === "menuDestination") {
      if (diff.newValue === true)
        this.#entries["routes"].style.setProperty("display", "flex");
      else this.#entries["routes"].style.setProperty("display", "none");
    }
  }

  #initMenuEntry(element, cityId, cityName) {
    const input = element.querySelector("input");
    const label = element.querySelector("label");

    // make unique across document by adding city to strings
    input.name = `city-menu-${cityId}`;
    input.id = `city-menu-${cityId}-${input.id}`;
    label.setAttribute(
      "for",
      `city-menu-${cityId}-${label.getAttribute("for")}`,
    );

    // needed for reacting when entry is chosen
    input.data = {
      type: "city",
      cityName: cityName,
      cityId: cityId,
      entry: input.value,
    };

    return input.value; // what is the "name" of this entry?
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
    const input = element.querySelector("input");
    const label = element.querySelector("label");

    // make unique across document by adding id to strings
    input.name = `edge-menu-${id}`;
    input.id = `edge-menu-${id}-${input.id}`;
    label.setAttribute("for", `edge-menu-${id}-${label.getAttribute("for")}`);

    // needed for reacting when entry is chosen
    input.data = {
      type: "edge",
      id: id,
      entry: input.value,
    };

    return input.value; // what is the "name" of this entry?
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
