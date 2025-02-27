import fs from "fs";

import { TravelCalendar } from "/script/customElements/travelCalendar/travelCalendar.js";
customElements.define("travel-calendar", TravelCalendar);

export function initDOMFromFile(htmlFilename) {
  const html = fs.readFileSync(htmlFilename, "utf8");

  // work-around to only get the body tag
  const el = document.createElement("html");
  el.innerHTML = html;
  const body = el.querySelector("body");

  // write body into the global document that is known to all tests (when using the jsdom environment)
  document.body.innerHTML = body.innerHTML;
}

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

class DOMQueryHelper {
  get calendar() {
    return document.querySelector("travel-calendar");
  }

  get calendarEntryParts() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".entry-part"));
  }

  get calendarDateLabels() {
    return Array.from(this.calendar.shadowRoot.querySelectorAll(".date-label"));
  }
}

export const DOM = new DOMQueryHelper();
