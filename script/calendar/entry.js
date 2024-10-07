class CalendarEntry extends HTMLElement {
  #visibilityStates = ["hidden", "indicator", "preview", "full"];

  constructor(id, group, date, startTime, endTime) {
    super();
    this.id = id;
    this.group = group;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;

    this._internals = this.attachInternals();
  }

  set visibility(status) {
    if (!this.#visibilityStates.includes(status))
      throw Error(`Unknown visibility status ${status}`);

    // remove all other visibility states
    for (const s of this.#visibilityStates) {
      if (s !== status) this._internals.states.delete(s);
    }
    this._internals.states.add(status);
  }

  //called when element is added to page
  connectedCallback() {}
}

function createCalendarEntry(connection) {
  const element = createElementFromTemplate("template-calendar-connection");

  element.getElementsByClassName("connection-icon")[0].src =
    `images/${connection.type}.svg`;
  element.getElementsByClassName("connection-number")[0].innerText =
    connection.displayId;

  // todo stop hardcoding
  if (!connection.id.endsWith("8503") && !connection.id.endsWith("18289")) {
    element.getElementsByClassName("connection-start-time")[0].innerText =
      connection.startTime;
    element.getElementsByClassName("connection-start-station")[0].innerText =
      connection.startStation.name;
    element.getElementsByClassName("connection-end-time")[0].innerText =
      connection.endTime;
    element.getElementsByClassName("connection-end-station")[0].innerText =
      connection.endStation.name;
  }

  const entry = new CalendarEntry(
    connection.id,
    connection.leg.id,
    connection.date,
    connection.startTime,
    connection.endTime,
  );
  entry.appendChild(element);

  return entry;
}

customElements.define("calendar-entry", CalendarEntry);
