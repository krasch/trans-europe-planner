import { calculateDiff } from "app/utils/collections.js";
import { createElementFromTemplate } from "app/utils/templates.js";

export function createEntryFromConnection(c) {
  const data = {
    ".": {
      "data-connection-id": c.id,
      "data-departure-datetime": c.departure.toISO(),
      "data-arrival-datetime": c.arrival.toISO(),
      "data-color": c.color ?? "",
      "data-group": c.leg ?? "",
      "data-status": c.status,
    },
    ".connection-icon": { src: c.icon },
    ".connection-number": { innerHTML: c.name },
    ".start .time": { innerHTML: c.departure.toFormat("HH:mm") },
    ".start .station": { innerHTML: c.from },
    ".destination .time": { innerHTML: c.arrival.toFormat("HH:mm") },
    ".destination .station": { innerHTML: c.to },
  };

  return createElementFromTemplate("template-calendar-connection", data);
}

export class CalendarWrapper {
  #callbacks = {
    connectionMoved: (newConnectionId) => {},
    connectionHover: (connectionId, isHover) => {},
  };

  #travelCalendar;
  #previousConnections = {};

  // can not replace this with a selector on [data.connection-id]
  // because the connection ids make invalid selectors
  #idToEntry = new Map();

  constructor(travelCalendar) {
    this.#travelCalendar = travelCalendar;

    this.#travelCalendar.on("hoverOn", (entry) => {
      this.#callbacks.connectionHover(entry.dataset.connectionId, true);
    });
    this.#travelCalendar.on("hoverOff", (entry) => {
      this.#callbacks.connectionHover(entry.dataset.connectionId, false);
    });
    this.#travelCalendar.on("drop", (entry) => {
      this.#callbacks.connectionMoved(entry.dataset.connectionId);
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }

  setConnectionHover(connectionId, isHover) {
    // can be undefined if hovering in map over inactive itinerary
    const entry = this.#idToEntry.get(connectionId);
    if (entry) this.#travelCalendar.setHoverEntry(entry, isHover);
  }

  /**
   * @typedef {import("app/components/_data/calendar.js").CalendarEvent} CalendarEvent
   *
   * @param {String} startDate
   * @param {CalendarEvent[]} connections
   */
  updateView(startDate, connections) {
    // change calendar start date if necessary
    if (this.#travelCalendar.getAttribute("start-date") !== startDate)
      this.#travelCalendar.setAttribute("start-date", startDate);

    // turn into object - todo should data just be an object?
    const newConnections = {};
    for (let c of connections) newConnections[c.id] = c;

    const diff = calculateDiff(
      Object.keys(this.#previousConnections),
      Object.keys(newConnections),
    );

    // remove entries that should no longer be displayed
    for (let id of diff.removed) {
      const entry = this.#idToEntry.get(id);
      this.#travelCalendar.removeChild(entry);
      this.#idToEntry.delete(id);
    }

    // update status for entries that are staying
    for (let id of diff.same) {
      if (this.#previousConnections[id].status !== newConnections[id].status) {
        this.#idToEntry.get(id).dataset.status = newConnections[id].status;
      }
    }

    // sort such that earliest will be first child etc
    // otherwise they might overlay each other and drag&drop won't work
    // warning: this only works because we are never adding new connections to existing legs
    // todo this should get moved into TravelCalendar
    // todo then we can also update by removing and re-adding without destroying order
    const toAddOrdered = diff.added.sort(
      (c1, c2) => newConnections[c1].departure - newConnections[c2].departure,
    );

    // add entry for each new connection in the right order
    for (let id of toAddOrdered) {
      const entry = createEntryFromConnection(newConnections[id]);
      this.#travelCalendar.appendChild(entry);
      this.#idToEntry.set(id, entry);
    }

    this.#previousConnections = newConnections;
  }
}
