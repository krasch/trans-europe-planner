class CalendarEntry extends HTMLElement {
  #visibilityStates = ["hidden", "indicator", "preview", "full"];

  constructor(id, group, startDateTime, endDateTime) {
    super();
    this.id = id;
    this.group = group;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;

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
    "connection-start-time": { innerText: connection.startDateTime.timeString },
    "connection-start-station": { innerText: connection.startStation.name },
    "connection-end-time": { innerText: connection.endDateTime.timeString },
    "connection-end-station": { innerText: connection.endStation.name },
  };

  // todo better fallback
  let templateId = "template-calendar-connection";
  if (connection.endDateTime.minutesSince(connection.startDateTime) < 4 * 60)
    templateId = "template-calendar-connection-short";

  const element = createElementFromTemplate(templateId, templateData);

  const entry = new CalendarEntry(
    connection.id,
    connection.leg.id,
    connection.startDateTime,
    connection.endDateTime,
  );
  entry.appendChild(element);

  return entry;
}

customElements.define("calendar-entry", CalendarEntry);
