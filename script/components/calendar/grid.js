const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

function diffDays(datetime, laterDatetime) {
  // get rid of hours/minutes/seconds
  datetime = new Date(datetime.toDateString());
  laterDatetime = new Date(laterDatetime.toDateString());

  const diffMillis = laterDatetime - datetime;
  return Math.ceil(diffMillis / (1000 * 60 * 60 * 24));
}

class CalendarGrid extends HTMLElement {
  static observedAttributes = ["start", "numDays", "resolution"];

  constructor() {
    super();
  }

  get resolution() {
    return Number(this.getAttribute("resolution"));
  }

  get startDay() {
    return new Date(this.getAttribute("start"));
  }

  get numDays() {
    return Number(this.getAttribute("num-days"));
  }

  //called when element is added to DOM
  connectedCallback() {
    this.#initHourLabels();
    this.#initEmptyCalendarCells();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "start") {
      this.#updateTableHeader();
    }
  }

  addToGrid(element) {
    const column = diffDays(this.startDay, element.startDateTime);
    const rowStart = this.#getRow(element.startDateTime);
    const rowEnd = this.#getRow(element.endDateTime);
    this.#addToGrid(element, column, rowStart, rowEnd);
  }

  #getRow(datetime) {
    const minutesSinceMidnight =
      datetime.getHours() * 60 + datetime.getMinutes();
    return Math.round((minutesSinceMidnight / 60.0) * this.resolution);
  }

  #addToGrid(element, column, rowStart, rowEnd) {
    const columnOffset = 1; // column 1 is date column
    const rowOffset = 8; // first x rows are for date header

    // +1 always because grid starts counting at 1
    element.style.gridColumn = column + 1 + columnOffset;
    element.style.gridRowStart = rowStart + 1 + rowOffset;
    element.style.gridRowEnd = rowEnd + 1 + rowOffset;
    this.appendChild(element);
  }

  #initHourLabels() {
    for (let hour = 0; hour < 24; hour++) {
      const element = createElementFromTemplate("template-calendar-grid-hour");
      element.innerText = `${hour}`.padStart(2, "0");

      element.classList.add("border-top");

      this.#addToGrid(
        element,
        -1,
        hour * this.resolution,
        (hour + 1) * this.resolution,
      );
    }
  }

  #initEmptyCalendarCells() {
    for (let day = 0; day < this.numDays; day++) {
      for (let i = 0; i < 24 * this.resolution; i++) {
        const element = createElementFromTemplate(
          "template-calendar-grid-cell",
        );
        if (i % this.resolution === 0) element.classList.add("border-top");

        element.id = `calender-cell-${day}-${i}`; // todo is this necessary?
        this.#addToGrid(element, day, i, i + 1);
      }
    }
  }

  // todo meh
  #updateTableHeader() {
    const start = new Date(this.startDay);

    for (let day = 0; day < this.numDays; day++) {
      const date = new Date(start.getTime() + 86400000 * day);

      const data = {
        ".weekday": {
          innerText: date.toLocaleString(LOCALE, { weekday: "short" }),
        },
        ".day": { innerText: date.getDate() },
        ".month": {
          innerText: date.toLocaleString(LOCALE, { month: "short" }),
        },
      };

      const id = `calendar-header-${day}`;

      let element = document.getElementById(id);
      if (element === null) {
        element = createElementFromTemplate(
          "template-calendar-grid-date",
          data,
        );
        element.id = id;
        this.#addToGrid(element, day, -8, 0);
      } else {
        updateElement(element, data);
      }
    }
  }
}
