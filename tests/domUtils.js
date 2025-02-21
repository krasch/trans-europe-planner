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

class DOMQueryHelper {
  get calendar() {
    return document.querySelector("travel-calendar");
  }

  get calendarEvents() {
    const parts = this.calendar.shadowRoot.querySelectorAll(".entry-part");
    parts.asObjects = () => Array.from(parts).map(this.#asObject);
    return parts;
  }

  #asObject(element) {
    return {
      dataset: Object.assign({}, element.dataset),
      style: Object.assign({}, element.style._values),
    };
  }
}

export const DOM = new DOMQueryHelper();
