class Calendar extends CalendarGrid {
  #callbacks = {
    legChanged: () => {},
    entryHoverStart: () => {},
    entryHoverStop: () => {},
  };

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
    enableDragAndDrop(this, (connectionIdString) =>
      this.#callbacks["legChanged"](
        ConnectionId.fromString(connectionIdString),
      ),
    );
  }

  on(name, callback) {
    this.#callbacks[name] = callback; // todo check that name valid
  }

  setHoverEntry(group) {
    for (let e of this.entriesForGroup(group)) e.hover = true;
  }

  setNoHoverEntry(group) {
    for (let e of this.entriesForGroup(group)) e.hover = false;
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    const connectionIds = connections.map((c) => c.id);
    for (let entry of this.entries) {
      if (!connectionIds.includes(entry.id)) entry.remove();
    }

    // add entries that are not yet in calendar
    for (let connection of connections) {
      if (!this.entry(connection.id)) {
        const entry = createCalendarEntry(connection);
        entry.draggable = true; // todo this should not be here
        this.addToGrid(entry);
      }
    }

    // only show the currently active entries
    for (let connection of connections) {
      const entry = this.entry(connection.id);

      if (connection.active) entry.visibility = "full";
      else entry.visibility = "hidden";

      entry.color = connection.color;
    }
  }

  get entries() {
    // arrayfrom is important!
    return Array.from(this.getElementsByTagName("calendar-entry"));
  }

  entriesForGroup(group) {
    return this.entries.filter((e) => e.group === group);
  }

  entry(id) {
    return document.getElementById(id); // todo
  }

  hide() {
    document
      .getElementById("calender-container")
      .style.setProperty("visibility", "hidden");
  }

  show() {
    document
      .getElementById("calender-container")
      .style.setProperty("visibility", "visible");
  }
}

customElements.define("calendar-grid", Calendar);
