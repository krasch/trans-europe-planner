// just needs to get loaded to be available as a custom element
const {
  TravelCalendar,
} = require("../../../script/components/calendar2/travelCalendar.js");

module.exports.ROW_MIDNIGHT = 2; // 1 for header, 1 because indexes start at 1
module.exports.COLUMN_FIRST_DAY = 2; // 1 for hour column, 1 because indexes start at 1
module.exports.DATES = ["2024-10-15", "2024-10-16", "2024-10-17"];

// quickly create datetime strings for dates 1, 2, 3
module.exports.t1 = (timeStr) => `${module.exports.DATES[0]}T${timeStr}`;
module.exports.t2 = (timeStr) => `${module.exports.DATES[1]}T${timeStr}`;
module.exports.t3 = (timeStr) => `${module.exports.DATES[2]}T${timeStr}`;

module.exports.createDocument = () => {
  document.body.innerHTML = `
    <travel-calendar id='calendar' start-date='${module.exports.DATES[0]}'></travel-calendar>`;
};

module.exports.createEntry = (startDateTime, endDateTime, kwargs = {}) => {
  const element = document.createElement("div");
  element.classList.add("calendar-entry");

  element.dataset.color = "test-color"; // not actually a valid color
  element.dataset.departureDatetime = startDateTime;
  element.dataset.arrivalDatetime = endDateTime;
  element.dataset.active = kwargs.active ? "active" : "";
  element.dataset.group = kwargs.group ?? "default-group";

  element.innerHTML = `
        <div class="header">From somewhere</div>
        <div class="start">Start time and city</div>
        <div class="destination">End time and city</div>
  `;

  return element;
};

// to grab items from grid to compare with expectations
module.exports.getShadowDOMItems = (calendar, querySelector) => {
  const elements = Array.from(
    calendar.shadowRoot.querySelectorAll(querySelector),
  );

  const childClasses = (e) =>
    Array.from(e.children).flatMap((c) => Array.from(c.classList));

  return {
    elements: elements,
    // returning these as getters so that it always takes the newest data directly from the
    // HTML element instead of having to fetch elements every time
    get data() {
      return elements.map((e) => ({
        innerHTML: e.innerHTML,
        column: e.style._values["grid-column"],
        rowStart: e.style._values["grid-row-start"],
        rowEnd: e.style._values["grid-row-end"],
        dragStatus: e.dataset.dragStatus,
        isHover: e.classList.contains("hover"),
        isActive: e.dataset.status === "active",
        isFirstPart: e.classList.contains("entry-first-part"),
        isLastPart: e.classList.contains("entry-last-part"),
        group: e.dataset.group,
        color: e.style.getPropertyValue("--color"),
        contains: childClasses(e),
      }));
    },
    // useful for some events tests, again as getters
    all: {
      get isHover() {
        return elements.map((e) => e.classList.contains("hover"));
      },
      get isActive() {
        return elements.map((e) => e.dataset.status === "active");
      },
      get dragStatus() {
        return elements.map((e) => e.dataset.dragStatus);
      },
    },
  };
};

module.exports.timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
