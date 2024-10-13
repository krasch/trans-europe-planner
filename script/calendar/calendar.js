class Calendar extends CalendarGrid {
  #callbacks = {
    legChanged: () => {},
    entryStartHover: () => {},
    entryStopHover: () => {},
  };

  constructor() {
    super();

    // user is hovering/stops hovering over an entry -> callback
    this.listen("mouseover", (entry) => {
      this.#callbacks["entryStartHover"](entry.group);
    });
    this.listen("mouseout", (entry) => {
      this.#callbacks["entryStopHover"](entry.group);
    });
  }

  on(name, callback) {
    this.#callbacks[name] = callback; // todo check that name valid
  }

  #addEntry(element) {
    const column = element.startDateTime.daysSince(this.startDay);
    const rowStart = super.getRow(element.startDateTime);
    const rowEnd = super.getRow(element.endDateTime);
    super.addToGrid(element, column, rowStart, rowEnd);
  }

  setHover(group) {
    for (let entry of this.getEntriesForGroup(group)) {
      entry.hover = true;
    }
  }

  setNoHover(group) {
    for (let entry of this.getEntriesForGroup(group)) {
      entry.hover = false;
    }
  }

  get entries() {
    return this.getElementsByTagName("calendar-entry");
  }

  getEntriesForGroup(group) {
    const result = [];
    for (const e of this.entries) {
      if (e.group === group) result.push(e);
    }
    return result;
  }

  #isEntry(element) {
    return element.tagName === "CALENDAR-ENTRY";
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    const toRemove = [];
    for (const element of this.entries) {
      if (!connections[element.id]) {
        toRemove.push(element);
      }
    }
    for (const element of toRemove) {
      element.remove();
    }

    // loop over desired connections
    for (let connection of Object.values(connections)) {
      let element = document.getElementById(connection.data.id);

      // we don't yet have an element for this connection
      if (!element) {
        element = createCalendarEntry(connection.data);
        this.#addEntry(element);
        element.draggable = true;
      }

      if (connection.active) element.visibility = "full";
      else element.visibility = "hidden";
    }
  }

  listen(type, listener, options) {
    super.addEventListener(
      type,
      (e) => {
        const closest = e.target.closest("calendar-entry");
        if (closest) listener(closest);
      },
      options,
    );
  }
}

customElements.define("calendar-grid", Calendar);
