const ICONS = {
  train: "images/icons/train.svg",
  ferry: "images/icons/ferry.svg",
};

export class CalendarWrapper {
  #callbacks = {
    legChanged: () => {},
    legHoverStart: () => {},
    legHoverStop: () => {},
  };

  travelCalendar;

  #idToEntry = new Map();
  #entryToId = new Map();

  constructor(travelCalendar) {
    this.travelCalendar = travelCalendar;

    this.travelCalendar.on("hoverOn", (entry) => {
      this.#callbacks.legHoverStart(entry.dataset.group);
    });
    this.travelCalendar.on("hoverOff", (entry) => {
      this.#callbacks.legHoverStop(entry.dataset.group);
    });
    this.travelCalendar.on("drop", (entry) => {
      this.#callbacks.legChanged(this.#entryToId.get(entry));
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }

  setHoverLeg(leg) {
    this.travelCalendar.setHoverGroup(leg);
  }

  setNoHoverLeg(leg) {
    this.travelCalendar.setNoHoverGroup(leg);
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
      this.travelCalendar.removeChild(entry);

      this.#idToEntry.delete(id_);
      this.#entryToId.delete(entry);
    }

    // add new entries
    for (let c of connections) {
      // already added before, just need to update
      if (this.#idToEntry.has(c.uniqueId)) {
        const entry = this.#idToEntry.get(c.uniqueId);
        this.#updateEntry(entry, c);
      }
      // new connection -> new entry
      else {
        const entry = this.#createEntryFromConnection(c);
        this.travelCalendar.appendChild(entry);

        this.#idToEntry.set(c.uniqueId, entry);
        this.#entryToId.set(entry, c.uniqueId);
      }
    }
  }

  #createEntryFromConnection(c) {
    const template = document.getElementById("template-calendar-connection");
    const e = template.content.firstElementChild.cloneNode(true);

    e.dataset.departureDatetime = c.startDateTime.toISO();
    e.dataset.arrivalDatetime = c.endDateTime.toISO();
    e.dataset.color = c.color ?? "";
    e.dataset.active = c.selected ? "active" : "";
    e.dataset.group = c.leg ?? "";

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

  #updateEntry(entry, c) {
    const active = c.selected ? "active" : "";
    if (active !== entry.dataset.active) entry.dataset.active = active;

    if (c.color && c.color !== entry.dataset.color)
      entry.dataset.color = c.color;
    if (c.leg && c.leg !== entry.dataset.group) entry.dataset.group = c.leg;

    // travelcalendar supports also changes in startDatetime and endDatetime
    // but right now those don't change and implementing anything here anyway might
    // lead to a lot of date formatting overhead so let's just not do it
  }
}
