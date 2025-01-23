class CalendarWrapper {
  #callbacks = {
    legChanged: () => {},
    entryHoverStart: () => {},
    entryHoverStop: () => {},
  };

  #travelCalendar;

  // maps from id to entry
  #entries = {};

  // maps from string id to original composite connection id
  #connectionIds = {};

  constructor(travelCalendar) {
    this.#travelCalendar = travelCalendar;

    this.#travelCalendar.on("hoverOn", this.#callbacks.entryHoverStart);
    this.#travelCalendar.on("hoverOff", this.#callbacks.entryHoverStart);
    this.#travelCalendar.on("drop", this.#callbacks.legChanged);
  }

  setHoverEntry(leg) {}

  setNoHoverEntry(leg) {}

  updateView(connections) {}
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.CalendarWrapper = CalendarWrapper;
}
