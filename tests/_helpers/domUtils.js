import fs from "fs";
import { TravelCalendar } from "script/customElements/travelCalendar/travelCalendar.js";
import { COLORS } from "./data.js";

customElements.define("travel-calendar", TravelCalendar);

/* read HTML file and instantiate in global document object */
export function initTestDOM() {
  const html = fs.readFileSync("index.html", "utf8");

  // work-around to only get the body tag
  const el = document.createElement("html");
  el.innerHTML = html;
  const body = el.querySelector("body");

  // write body into the global document that is known to all tests (when using the jsdom environment)
  document.body.innerHTML = body.innerHTML;

  // set test connection colors
  COLORS.forEach((color, idx) =>
    document.body.style.setProperty(`--color${idx + 1}`, color),
  );
}

export function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* make content of DOM element easier accessible in tests*/
export function domElementToObject(element, optionalSelectors = null) {
  if (!element) return null;

  const result = {
    id: element.id,
    dataset: Object.assign({}, element.dataset),
    style: Object.assign({}, element.style._values),
    innerHTML: element.innerHTML,
    innerText: element.innerText,
  };

  for (let s of element.attributes) {
    if (s.name.startsWith("data") || ["style"].includes(s.name)) continue;
    result[s.name] = s.value;
  }

  if (optionalSelectors) {
    result.selectors = {};
    for (let s in optionalSelectors)
      result.selectors[s] = domElementToObject(element.querySelector(s));
  }

  return result;
}

/* custom jest matcher to be able to test DOM elements very similar to testing objects*/
/* this is called every time this file is imported, i.e. extending multiple times, seems not an issue */
expect.extend({
  toMatchDOMObject(actual, expected) {
    // extract all the necessary data from the dom element
    actual = domElementToObject(actual, expected.selectors);

    // then can do normal object matching
    expect(actual).toMatchObject(expected);

    // this is only necessary to satisfy the API requirements of jest
    return { pass: true };
  },
});

export async function dispatchTestEvent(
  element,
  eventName,
  eventData = {},
  timeout_ms = 10,
) {
  class MapMouseEvent extends MouseEvent {
    constructor(name, config, data) {
      super(name, config);
      this.lngLat = 10;
      this.features = [{ state: { isVisible: true }, id: "C1" }];
    }
  }

  const classes = {
    mouseover: MouseEvent,
    mouseout: MouseEvent,
    mousemove: MapMouseEvent,
    click: MapMouseEvent,
    dragstart: DragEvent,
    dragend: DragEvent,
    dragenter: DragEvent,
    dragleave: DragEvent,
    drop: DragEvent,
  };

  const clazz = classes[eventName];
  const event = new clazz(eventName, { bubbles: true }, eventData);

  element.dispatchEvent(event);

  // wait for changes after dispatching to hove finished (hopefully waiting long enough)...
  await timeout(timeout_ms);
}

// utility class to easily access items in the DOM
// uses getter functions so that we always get the current DOM elements
class DOMQueryHelper {
  get map() {
    return document.querySelector("#map");
  }

  get datePicker() {
    return document.querySelector("#config");
  }

  get calendar() {
    return document.querySelector("travel-calendar");
  }

  // these are the external calendar entries
  get calendarEntries() {
    return Array.from(this.calendar.querySelectorAll(".calendar-entry"));
  }

  // these are the internal calendar entry parts in the shadow dome
  // each external entry can be mapped to multiple internal entry parts
  get calendarEntryParts() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".entry-part"));
  }

  // these are the internal calendar labels in the grid
  get calendarDateLabels() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".date-label"));
  }

  // the summary element which contains the perlschnur
  get summary() {
    return document.querySelector("#summary");
  }

  get perlschnurConnections() {
    return Array.from(this.summary.querySelectorAll(".perlschnur-connection"));
  }

  get perlschnurTransfers() {
    return Array.from(this.summary.querySelectorAll(".perlschnur-transfer"));
  }
}

export const TEST_DOM = new DOMQueryHelper();
