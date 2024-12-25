// important todo: sort collections by departure

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
    enableDragAndDrop(this, (closest) => {
      // todo just store the unique ids somewhere in here as a mapping rather than doing this?
      const uniqueId = {
        id: closest.dataset.id,
        startCityName: closest.dataset.startCityName,
        endCityName: closest.dataset.endCityName,
        date: new Date(closest.dataset.date),
      };
      this.#callbacks["legChanged"](uniqueId);
    });
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
    // need string id as html element
    const connectionsMap = {};
    for (let c of connections) connectionsMap[this.#idString(c.uniqueId)] = c;

    // remove entries that are currently in calendar but no longer necessary
    const connectionIds = Object.keys(connectionsMap);
    for (let entry of this.entries) {
      if (!connectionIds.includes(entry.id)) entry.remove();
    }

    // add entries that are not yet in calendar
    for (let id in connectionsMap) {
      if (!this.entry(id)) {
        const entry = createCalendarEntry(connectionsMap[id]);
        entry.id = id;
        entry.draggable = true; // todo this should not be here
        this.addToGrid(entry);
      }
    }

    // only show the currently active entries
    for (let id in connectionsMap) {
      const connection = connectionsMap[id];
      const entry = this.entry(id);

      if (connection.selected) entry.visibility = "full";
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

  #idString(id) {
    return `${id.id}XX${id.startCityName}->${id.endCityName}XX${id.date.toLocaleDateString("sv")}`;
  }
}

customElements.define("calendar-grid", Calendar);
