import fs from "fs";

import { TravelCalendar } from "/script/customElements/travelCalendar/travelCalendar.js";

customElements.define("travel-calendar", TravelCalendar);

/* read HTML file and instantiate in global document object */
export function initDOMFromFile(htmlFilename) {
  const html = fs.readFileSync(htmlFilename, "utf8");

  // work-around to only get the body tag
  const el = document.createElement("html");
  el.innerHTML = html;
  const body = el.querySelector("body");

  // write body into the global document that is known to all tests (when using the jsdom environment)
  document.body.innerHTML = body.innerHTML;
}

/* make content of DOM element easier accessible in tests*/
export function domElementToObject(element, optionalSelectors = null) {
  if (!element) return null;

  const result = {
    dataset: Object.assign({}, element.dataset),
    style: Object.assign({}, element.style._values),
    innerHTML: element.innerHTML,
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
    expect(actual).toHaveLength(expected.length);

    // extract all the necessary data from the dom element
    actual = actual.map((e, i) => domElementToObject(e, expected[i].selectors));

    // then can do normal object matching
    expect(actual).toMatchObject(expected);

    // this is only necessary to satisfy the API requirements of jest
    return { pass: true };
  },
});

export const timeout = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

/*utility class to easily access items in the DOM */
class DOMQueryHelper {
  get calendar() {
    return document.querySelector("travel-calendar");
  }

  get datePicker() {
    return document.querySelector("#config");
  }

  get calendarEntryParts() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".entry-part"));
  }

  get calendarDateLabels() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".date-label"));
  }
}

export const DOM = new DOMQueryHelper();
