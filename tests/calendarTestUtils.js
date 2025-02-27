// to get drag events
import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";

export const ROW_MIDNIGHT = 2; // 1 for header, 1 because indexes start at 1
export const COLUMN_FIRST_DAY = 2; // 1 for hour column, 1 because indexes start at 1
export const DATES = ["2024-10-15", "2024-10-16", "2024-10-17"];

// quickly create datetime strings for dates 1, 2, 3
export const t1 = (timeStr) => `${DATES[0]}T${timeStr}`;
export const t2 = (timeStr) => `${DATES[1]}T${timeStr}`;
export const t3 = (timeStr) => `${DATES[2]}T${timeStr}`;

export const createDocument = () => {
  document.body.innerHTML = `
    <travel-calendar id='calendar' start-date='${DATES[0]}'></travel-calendar>`;
};

export const createEntry = (startDateTime, endDateTime, kwargs = {}) => {
  const template = document.getElementById("template-calendar-connection");
  const e = template.content.firstElementChild.cloneNode(true);

  e.dataset.departureDatetime = startDateTime;
  e.dataset.arrivalDatetime = endDateTime;
  e.dataset.color = kwargs.color ?? "test-color";
  e.dataset.active = kwargs.active ?? "inactive";
  e.dataset.group = kwargs.group ?? "default-group";

  e.querySelector(".connection-icon").src = "train.svg";
  e.querySelector(".connection-number").innerHTML =
    kwargs.connectionNumber ?? "test-connection-number";
  e.querySelector(".start .time").innerHTML =
    DateTime.fromISO(startDateTime).toFormat("HH:mm");
  e.querySelector(".start .station").innerHTML =
    kwargs.startStation ?? "start-station";
  e.querySelector(".destination .time").innerHTML =
    DateTime.fromISO(endDateTime).toFormat("HH:mm");
  e.querySelector(".destination .station").innerHTML =
    kwargs.endStation ?? "end-station";

  return e;
};

// to grab items from grid to compare with expectations
export const getShadowDOMItems = (calendar, querySelector) => {
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

export const dispatchEvent = async (element, eventName, timeout_ms = 10) => {
  const classes = {
    mouseover: MouseEvent,
    mouseout: MouseEvent,
    dragstart: DragEvent,
    dragend: DragEvent,
    dragenter: DragEvent,
    dragleave: DragEvent,
    drop: DragEvent,
  };

  const clazz = classes[eventName];
  const event = new clazz(eventName, { bubbles: true });

  element.dispatchEvent(event);

  // wait for changes after dispatching to hove finished (hopefully waiting long enough)...
  await timeout(timeout_ms);
};

export const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
