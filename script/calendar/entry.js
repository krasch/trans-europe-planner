class CalendarEntry extends HTMLElement {
  #visibilityStates = ["hidden", "indicator", "preview", "full"];

  constructor(id, group, date, startTime, endTime) {
    super();
    this.id = id;
    this.group = group;
    this.date = date;
    this.startTime = startTime;
    this.endTime = endTime;

    // does not work with older browsers
    // this._internals = this.attachInternals();
  }

  set visibility(status) {
    if (!this.#visibilityStates.includes(status))
      throw Error(`Unknown visibility status ${status}`);

    // remove all other visibility states
    for (const s of this.#visibilityStates) {
      if (s !== status) this.classList.remove(s);
    }
    // set new visibility status
    if (!this.classList.contains(status)) this.classList.add(status);
  }

  //called when element is added to page
  connectedCallback() {}
}

function createCalendarEntry(connection) {
  const templateData = {
    "connection-icon": { src: `images/${connection.type}.svg` },
    "connection-number": { innerText: connection.displayId },
    "connection-start-time": { innerText: connection.startTime },
    "connection-start-station": { innerText: connection.startStation.name },
    "connection-end-time": { innerText: connection.endTime },
    "connection-end-station": { innerText: connection.endStation.name },
  };

  // todo better fallback
  let templateId = "template-calendar-connection";
  if (differenceInHours(connection.startTime, connection.endTime) < 4)
    templateId = "template-calendar-connection-short";

  const element = createElementFromTemplate(templateId, templateData);

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
