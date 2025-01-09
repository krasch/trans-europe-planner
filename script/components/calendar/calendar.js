class Calendar extends CalendarGrid {
  #callbacks = {
    legChanged: () => {},
    entryHoverStart: () => {},
    entryHoverStop: () => {},
  };

  // maps from id to entry
  #entries = {};

  // maps from string id to original composite connection id
  #connectionIds = {};

  constructor() {
    super();

    // user is hovering/stops hovering over an entry -> callback
    this.addEventListener("mouseover", (e) => {
      const closest = e.target.closest("calendar-entry");
      if (closest) this.#callbacks["entryHoverStart"](closest.group);
    });
    this.addEventListener("mouseout", (e) => {
      const closest = e.target.closest("calendar-entry");
      if (closest) this.#callbacks["entryHoverStop"](closest.group);
    });

    // user can change leg to use different connection using drag&drop
    enableDragAndDrop(this, (closest) => {
      this.#callbacks["legChanged"](this.#connectionIds[closest.id]);
    });
  }

  on(name, callback) {
    this.#callbacks[name] = callback; // todo check that name valid
  }

  setHoverEntry(leg) {
    for (let e of this.entriesForGroup(leg)) e.hover = true;
  }

  setNoHoverEntry(leg) {
    for (let e of this.entriesForGroup(leg)) e.hover = false;
  }

  updateView(connections) {
    // sort such that earliest will be first child etc
    // otherwise they might overlay each other and drag&drop won't work
    connections.sort((c1, c2) => c1.startDateTime - c2.startDateTime);

    if (this.dateChanged) {
      // remove all entries because they might be invalid anyway
      // because the calendar start date has changed
      // which means that their column should have been updated (but which we currently don't do)
      for (let key in this.#entries) this.#entries[key].remove();
      this.#entries = {};
      this.#connectionIds = {};

      this.dateChanged = false;
    }

    // remove entries that are currently in calendar but no longer necessary
    const connectionIds = connections.map((c) => this.#idString(c.uniqueId));
    for (let id in this.#entries) {
      if (!connectionIds.includes(id)) {
        this.#entries[id].remove();
        delete this.#entries[id];
        delete this.#connectionIds[id];
      }
    }

    // add entries that are not yet in calendar
    for (let connection of connections) {
      const idString = this.#idString(connection.uniqueId);
      let entry = this.#entries[idString];

      if (!entry) {
        entry = createCalendarEntry(connection);
        entry.id = idString;
        entry.draggable = true; // todo this should not be here

        this.addToGrid(entry);
        this.#entries[idString] = entry;
        this.#connectionIds[idString] = connection.uniqueId;
      }

      // only show the currently selected entries
      if (connection.selected) entry.visibility = "full";
      else entry.visibility = "hidden";
      entry.color = connection.color;
    }
  }

  #idString(id) {
    return `${id.id}XX${id.startCityName}->${id.endCityName}XX${id.date.toISODate()}`;
  }

  //also used by drag and drop
  entriesForGroup(leg) {
    const result = [];
    for (let entry of Object.values(this.#entries))
      if (entry.group === leg) result.push(entry);
    return result;
  }
}

customElements.define("calendar-grid", Calendar);
