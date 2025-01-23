const ICONS = {
  train: "images/icons/train.svg",
  ferry: "images/icons/ferry.svg",
};

class CalendarWrapper {
  #callbacks = {
    legChanged: () => {},
    entryHoverStart: () => {},
    entryHoverStop: () => {},
  };

  #travelCalendar;

  #idToEntry = new Map();
  #entryToId = new Map();

  constructor(travelCalendar) {
    this.#travelCalendar = travelCalendar;

    this.#travelCalendar.on("hoverOn", (entry) => {
      this.#callbacks.entryHoverStart(this.#entryToId.get(entry));
    });
    this.#travelCalendar.on("hoverOff", (entry) => {
      this.#callbacks.entryHoverStop(this.#entryToId.get(entry));
    });
    this.#travelCalendar.on("drop", (entry) => {
      this.#callbacks.legChanged(this.#entryToId.get(entry));
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }

  setHoverLeg(leg) {
    this.#travelCalendar.setHoverGroup(leg);
  }

  setNoHoverLeg(leg) {
    this.#travelCalendar.setNoHoverGroup(leg);
  }

  updateView(connections) {
    // sort such that earliest will be first child etc
    // otherwise they might overlay each other and drag&drop won't work
    // warning: this only works because we are never adding new connections to existing legs
    connections.sort((c1, c2) => c1.startDateTime - c2.startDateTime);

    // remove entries that are currently in calendar but no longer necessary
    const ids = connections.map((c) => c.uniqueId);
    for (let id_ of this.#idToEntry.keys()) {
      if (ids.includes(id_)) continue; // still necessary

      const entry = this.#idToEntry.get(id_);
      this.#travelCalendar.removeChild(entry);

      this.#idToEntry.delete(id_);
      this.#entryToId.delete(entry);
    }

    // add new entries
    for (let c of connections) {
      if (this.#idToEntry.has(c.uniqueId)) continue; // already added

      const entry = this.#createEntryFromConnection(c);
      this.#travelCalendar.appendChild(entry);

      this.#idToEntry.set(c.uniqueId, entry);
      this.#entryToId.set(entry, c.uniqueId);
    }

    // update entry settings
    for (let c of connections) {
      const entry = this.#idToEntry.get(c.uniqueId);

      const shouldBeSelected = c.selected ?? false;
      const isCurrentlyActive = entry.dataset.active === "active";

      if (shouldBeSelected === isCurrentlyActive) continue;

      entry.dataset.active = shouldBeSelected ? "active" : "";
    }
  }

  #createEntryFromConnection(c) {
    const template = document.getElementById("template-calendar-connection");
    const e = template.content.firstElementChild.cloneNode(true);

    e.dataset.departureDatetime = c.startDateTime.toISO();
    e.dataset.arrivalDatetime = c.endDateTime.toISO();
    e.dataset.color = c.color;
    e.dataset.active = c.selected ? "active" : "";
    e.dataset.group = c.leg;

    e.querySelector(".connection-icon").src = ICONS[c.type];
    e.querySelector(".connection-number").innerHTML = c.name;
    e.querySelector(".start .time").innerHTML =
      c.startDateTime.toFormat("HH:mm");
    e.querySelector(".start .station").innerHTML = c.startStation;
    e.querySelector(".destination .time").innerHTML =
      c.endDateTime.toFormat("HH:mm");
    e.querySelector(".destination .station").innerHTML = c.endStation;

    return e;
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.CalendarWrapper = CalendarWrapper;
}
