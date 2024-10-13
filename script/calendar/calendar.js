class Calendar extends CalendarGrid {
  #callbacks = {
    legChanged: () => {},
    entryStartHover: () => {},
    entryStopHover: () => {},
  };

  constructor() {
    super();

    // user is hovering/stops hovering over an entry -> callback
    this.addEventListener("mouseover", (e) => {
      const closest = e.target.closest("calendar-entry");
      if (closest) this.#callbacks["entryStartHover"](closest.group);
    });
    this.addEventListener("mouseout", (e) => {
      const closest = e.target.closest("calendar-entry");
      if (closest) this.#callbacks["entryStopHover"](closest.group);
    });
  }

  on(name, callback) {
    this.#callbacks[name] = callback; // todo check that name valid
  }

  setHover(group) {
    for (let e of this.#entriesForGroup(group)) e.hover = true;
  }

  setNoHover(group) {
    for (let e of this.#entriesForGroup(group)) e.hover = false;
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    for (let entry of this.#entries) {
      if (!connections[entry.id]) entry.remove();
    }

    // add entries that are not yet in calendar
    for (let connection of Object.values(connections)) {
      if (!this.#entry(connection.data.id))
        this.addToGrid(createCalendarEntry(connection.data));
    }

    // only show the currently active entries
    for (let entry of this.#entries)
      if (connections[entry.id].active) entry.visibility = "full";
      else entry.visibility = "hidden";
  }

  get #entries() {
    // arrayfrom is important!
    return Array.from(this.getElementsByTagName("calendar-entry"));
  }

  #entriesForGroup(group) {
    return this.#entries.filter((e) => e.group === group);
  }

  #entry(id) {
    return document.getElementById(id); // todo
  }

  #isEntry(element) {
    return element.tagName === "CALENDAR-ENTRY";
  }
}

customElements.define("calendar-grid", Calendar);
