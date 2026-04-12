import { geocode, getStopInfo } from "app/data/motis/client.js";
import { DateTime } from "app/types/dateTime.js";
import { Stop } from "app/types/stop.js";
import { createElementFromTemplate } from "app/utils/templates.js";

/**
 * @param {Stop} stop
 * @returns {HTMLElement}
 */
function createAutocompleteItem(stop) {
  const template = `template-config-autocomplete-stop`;

  const templateData = {
    ".": { "data-id": stop.id },
    span: { innerHTML: stop.name },
  };

  return createElementFromTemplate(template, templateData);
}

export class Config {
  #elements = {};

  #callbacks = {
    submit: (from, to, date) => {},
  };

  /**
   * @param {Element} container
   */
  constructor(container) {
    const today = DateTime.now().startOf("day");
    const calendarMin = today;
    const calendarMax = today.plus({ days: 3 * 30 });

    this.#elements = {
      from: container.querySelector("#config-from"),
      fromAutocomplete: container.querySelector("#config-from-values"),
      to: container.querySelector("#config-to"),
      toAutocomplete: container.querySelector("#config-to-values"),
      date: container.querySelector("#config-date"),
      submit: container.querySelector("button"),
      error: container.querySelector("#planner-error"),
    };

    this.#elements.date.min = calendarMin.toISODate();
    this.#elements.date.max = calendarMax.toISODate();

    this.#checkSubmitPossible();

    this.#elements.from.addEventListener("input", async (e) => {
      const userInput = this.#elements.from.value;
      if (userInput.length < 3) {
        this.#elements.fromAutocomplete.innerHTML = "";
        return;
      }

      const geocoded = await geocode(userInput);
      const stops = geocoded.map(createAutocompleteItem);
      this.#elements.fromAutocomplete.replaceChildren(...stops);
    });

    this.#elements.to.addEventListener("input", async (e) => {
      const userInput = this.#elements.to.value;
      if (userInput.length < 3) {
        this.#elements.toAutocomplete.innerHTML = "";
        return;
      }

      const geocoded = await geocode(userInput);
      const stops = geocoded.map(createAutocompleteItem);
      this.#elements.toAutocomplete.replaceChildren(...stops);
    });

    this.#elements.date.addEventListener("input", async (e) => {
      this.#checkSubmitPossible();
    });

    this.#elements.fromAutocomplete.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      const stop = await getStopInfo(li.dataset.id);
      this.#elements.from.value = stop.name;
      this.#elements.from.dataset.id = stop.id;
      this.#elements.fromAutocomplete.innerHTML = "";

      this.#checkSubmitPossible();
    });

    this.#elements.toAutocomplete.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      const stop = await getStopInfo(li.dataset.id);
      this.#elements.to.value = stop.name;
      this.#elements.to.dataset.id = stop.id;
      this.#elements.toAutocomplete.innerHTML = "";

      this.#checkSubmitPossible();
    });

    container.addEventListener("submit", (e) => {
      e.preventDefault();

      this.#callbacks.submit(
        this.#elements.from.dataset.id,
        this.#elements.to.dataset.id,
        DateTime.fromISO(this.#elements.date.value),
      );
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  /**
   * @param {String} from
   * @param {String} to
   * @param {DateTime} date
   */
  updateView(from, to, date) {
    // todo only update when changed
    // todo unset
    if (date) this.#elements.date.setAttribute("value", date.toISODate());
    if (from) this.#elements.from.setAttribute("value", from);
    if (to) this.#elements.to.setAttribute("value", to);
  }

  lock() {
    for (let key in this.#elements) this.#elements[key].disabled = true;
    this.#elements.submit.classList.add("spinning");
  }

  unlock() {
    for (let key in this.#elements) this.#elements[key].disabled = false;
    this.#elements.submit.classList.remove("spinning");
  }

  #checkSubmitPossible() {
    const hasFrom = this.#elements.from.dataset.id;
    const hasTo = this.#elements.to.dataset.id;
    const hasDate = this.#elements.date.value;
    this.#elements.submit.disabled = !hasFrom || !hasTo || !hasDate;
  }
}
