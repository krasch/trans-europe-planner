// this class shows/hides popups and keeps popup state
// todo replace with CityMenu when doing EdgeMenus
class PopupHelper {
  constructor(map, getIdFn, htmlFn) {
    let currentId = null;
    let currentPopup = null;

    this.show = (e) => {
      const id = getIdFn(e);

      // popup is currently being shown for this item, nothing to do
      if (currentId === id) return;

      // just in case a popup is currently being shown for some other item (should not happen)
      this.hide();

      // show
      currentId = id;
      currentPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: "left",
        offset: [10, 0],
      });
      currentPopup.setLngLat(e.lngLat).setHTML(htmlFn(e)).addTo(map);
    };

    this.hide = (e) => {
      if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
        currentId = null;
      }
    };
  }
}

class CityMarker {
  #markerElement; // the html element
  marker; // the actual maplibre marker object

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

  constructor(cities) {
    for (let id in cities) {
      this.markers[id] = new CityMarker(cities[id].lngLat);
    }
  }

  update(map, diffs) {
    for (let diff of diffs) {
      this.markers[diff.id].update(diff);

      if (diff.kind === "added" && diff.key === "markerIcon")
        this.markers[diff.id].marker.addTo(map);

      if (diff.kind === "removed" && diff.key === "markerIcon")
        this.markers[diff.id].marker.remove();
    }
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
      ".city": { innerText: name },
    });
    this.#popupElement.id = `city-menu-${id}`;

    for (let entryContainer of this.#popupElement.querySelectorAll(".row")) {
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

  constructor(sourceName) {
    this.#sourceName = sourceName;
  }

  update(map, diffs) {
    if (diffs.length === 0) return;

    const grouped = groupDiffsById(diffs);

    for (let id in grouped) {
      const current = map.getFeatureState({
        source: this.#sourceName,
        id: id,
      });

      for (let diff of grouped[id]) {
        if (diff.kind === "updated" || diff.kind === "added")
          current[diff.key] = diff.newValue;
        else if (diff.kind === "removed") {
          current[diff.key] = null; // don't delete key because maplibre does not notice deletes
        }
      }

      map.setFeatureState({ source: this.#sourceName, id: id }, current);
    }
  }
}
