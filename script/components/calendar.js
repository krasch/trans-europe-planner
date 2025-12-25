import { DateTime } from "script/types/dateTime.js";
import { createElementFromTemplate } from "script/util.js";

export class CalendarWrapper {
  #callbacks = {
    connectionMoved: (newConnectionId) => {},
    connectionHover: (connectionId, isHover) => {},
  };

  #travelCalendar;

  #idToEntry = new Map();
  #entryToId = new Map();

  constructor(travelCalendar) {
    this.#travelCalendar = travelCalendar;

    this.#travelCalendar.on("hoverOn", (entry) => {
      this.#callbacks.connectionHover(this.#entryToId.get(entry), true);
    });
    this.#travelCalendar.on("hoverOff", (entry) => {
      this.#callbacks.connectionHover(this.#entryToId.get(entry), false);
    });
    this.#travelCalendar.on("drop", (entry) => {
      this.#callbacks.connectionMoved(this.#entryToId.get(entry));
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }

  setHoverConnection(connectionId, isHover) {
    const entry = this.#idToEntry.get(connectionId);
    // can be undefined if hovering in map over inactive itinerary
    if (entry) this.#travelCalendar.setHoverEntry(entry, isHover);
  }

  /**
   * @typedef {import("script/data/components/calendar.js").CalendarEvent} CalendarEvent
   *
   * @param {DateTime} startDate
   * @param {CalendarEvent[]} connections
   */
  updateView(startDate, connections) {
    // change calendar start date if necessary
    if (this.#travelCalendar.getAttribute("start-date") !== startDate)
      this.#travelCalendar.setAttribute("start-date", startDate);

    // sort such that earliest will be first child etc
    // otherwise they might overlay each other and drag&drop won't work
    // warning: this only works because we are never adding new connections to existing legs
    // @ts-expect-error 2362 (minus not defined for our DateTime type)
    connections.sort((c1, c2) => c1.departure - c2.departure);

    // remove entries that are currently in calendar but no longer necessary
    const ids = connections.map((c) => c.id);
    for (let id_ of this.#idToEntry.keys()) {
      if (ids.includes(id_)) continue; // still necessary

      const entry = this.#idToEntry.get(id_);
      this.#travelCalendar.removeChild(entry);

      this.#idToEntry.delete(id_);
      this.#entryToId.delete(entry);
    }

    // add new entries
    for (let c of connections) {
      // already added before, just need to update
      if (this.#idToEntry.has(c.id)) {
        const entry = this.#idToEntry.get(c.id);
        this.#updateEntry(entry, c);
      }
      // new connection -> new entry
      else {
        const entry = this.#createEntryFromConnection(c);
        this.#travelCalendar.appendChild(entry);

        this.#idToEntry.set(c.id, entry);
        this.#entryToId.set(entry, c.id);
      }
    }
  }

  #createEntryFromConnection(c) {
    const data = {
      ".connection-icon": { src: c.icon },
      ".connection-number": { innerHTML: c.name },
      ".start .time": { innerHTML: c.departure.toFormat("HH:mm") },
      ".start .station": { innerHTML: c.from },
      ".destination .time": { innerHTML: c.arrival.toFormat("HH:mm") },
      ".destination .station": { innerHTML: c.to },
    };

    // try to move dataset into the above
    const e = createElementFromTemplate("template-calendar-connection", data);
    e.dataset.departureDatetime = c.departure.toISO();
    e.dataset.arrivalDatetime = c.arrival.toISO();
    e.dataset.color = c.color ?? "";
    e.dataset.group = c.leg ?? "";
    e.dataset.status = c.status;

    return e;
  }

  #updateEntry(entry, c) {
    // travelcalendar supports also changes in startDatetime and endDatetime
    // but right now those don't change and implementing anything here anyway might
    // lead to a lot of date formatting overhead so let's just not do it
    // todo then do I want to allow updating at all?

    for (let key of ["color", "leg", "status"]) {
      if (c[key] !== entry.dataset[key]) entry.dataset[key] = c[key];
    }
  }
}
