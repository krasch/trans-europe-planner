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

  updateView(connections) {
    const entry = this.#createEntryFromConnection(connections[0]);
    this.#travelCalendar.appendChild(entry);
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

  #datetimeString(datetime) {
    return datetime.toISO();
  }

  #timeString(datetime) {
    return datetime.toFormat("HH:mm");
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.CalendarWrapper = CalendarWrapper;
}
