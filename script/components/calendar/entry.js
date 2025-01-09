class CalendarEntry extends HTMLElement {
  #visibilityStates = ["hidden", "indicator", "preview", "full"];

  constructor(connection) {
    // todo this constructor will not work if placed in HTML directly
    // because using custom JS class and because of not using attributes
    super();

    this.group = connection.leg;
    this.startDateTime = connection.startDateTime;
    this.endDateTime = connection.endDateTime;
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

  set hover(hover) {
    if (hover) this.classList.add("hover");
    else this.classList.remove("hover");
  }

  set color(color) {
    this.style.setProperty("--color", color);
  }
}

function createCalendarEntry(connection) {
  const templateData = {
    ".connection-icon": { src: `images/icons/${connection.type}.svg` },
    ".connection-number": { innerText: connection.name },
    ".connection-start-time": {
      innerText: connection.startDateTime.toFormat("HH:mm"),
    },
    ".connection-start-station": { innerText: connection.startStation },
    ".connection-end-time": {
      innerText: connection.endDateTime.toFormat("HH:mm"),
    },
    ".connection-end-station": { innerText: connection.endStation },
  };

  let templateId = "template-calendar-connection";
  const element = createElementFromTemplate(templateId, templateData);

  const entry = new CalendarEntry(connection);
  entry.appendChild(element);

  return entry;
}

customElements.define("calendar-entry", CalendarEntry);
