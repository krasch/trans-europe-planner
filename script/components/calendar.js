import { DateTime } from "script/types/dateTime.js";
import { createElementFromTemplate } from "script/util.js";

export class CalendarWrapper {
  #callbacks = {
    legChanged: (newConnection) => {},
    legHoverStart: (leg) => {},
    legHoverStop: (leg) => {},
  };

  #travelCalendar;

  #idToEntry = new Map();
  #entryToId = new Map();

  constructor(travelCalendar) {
    this.#travelCalendar = travelCalendar;

    this.#travelCalendar.on("hoverOn", (entry) => {
      this.#callbacks.legHoverStart(entry.dataset.group);
    });
    this.#travelCalendar.on("hoverOff", (entry) => {
      this.#callbacks.legHoverStop(entry.dataset.group);
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
    // @ts-expect-error 2362 - minus not defined for our DateTime type
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
    e.dataset.active = c.isActive ? "active" : "";
    e.dataset.group = c.leg ?? "";

    return e;
  }

  #updateEntry(entry, c) {
    const active = c.isActive ? "active" : "";
    if (active !== entry.dataset.active) entry.dataset.active = active;

    if (c.color && c.color !== entry.dataset.color)
      entry.dataset.color = c.color;
    if (c.leg && c.leg !== entry.dataset.group) entry.dataset.group = c.leg;

    // travelcalendar supports also changes in startDatetime and endDatetime
    // but right now those don't change and implementing anything here anyway might
    // lead to a lot of date formatting overhead so let's just not do it
  }
}
