const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

class CalendarGrid extends HTMLElement {
  static observedAttributes = ["start", "end", "resolution"];

  constructor() {
    super();
  }

  get resolution() {
    return Number(this.getAttribute("resolution"));
  }

  get startDay() {
    return this.getAttribute("start");
  }

  get numDays() {
    return Number(this.getAttribute("num-days"));
  }

  //called when element is added to DOM
  connectedCallback() {
    this.#initHourLabels();
    this.#initEmptyCalendarCells();
    this.#initTableHeader();
  }

  addToGrid(element) {
    const column = element.startDateTime.daysSince(this.startDay);
    const rowStart = this.#getRow(element.startDateTime);
    const rowEnd = this.#getRow(element.endDateTime);
    this.#addToGrid(element, column, rowStart, rowEnd);
  }

  #getRow(datetime) {
    return Math.round((datetime.minutesSinceMidnight / 60.0) * this.resolution);
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

        element.id = `calender-cell-${day}-${i}`;
        this.#addToGrid(element, day, i, i + 1);
      }
    }
  }

  #initTableHeader() {
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

      const element = createElementFromTemplate(
        "template-calendar-grid-date",
        data,
      );

      this.#addToGrid(element, day, -8, 0);
    }
  }
}
