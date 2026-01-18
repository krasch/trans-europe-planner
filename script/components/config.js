import { geocode } from "script/motis/client.js";
import { GeocodedLocation } from "script/motis/parser.js";
import { DateTime } from "script/types/dateTime.js";
import { createElementFromTemplate } from "script/util.js";

/**
 * @param {GeocodedLocation} data
 * @returns {HTMLElement}
 */
function createAutocompleteItem(data) {
  const template = `template-config-autocomplete-${data.kind}`;

  const element = createElementFromTemplate(template, {
    span: { innerHTML: data.name },
  });
  element.dataset.name = data.name;
  element.dataset.data = JSON.stringify(data);
  return element;
}

/**
 * @param {HTMLInputElement} inputElement
 * @param {HTMLUListElement} autocompleteContainer
 */
export async function setAutocompleteOptions(
  inputElement,
  autocompleteContainer,
) {
  const userInput = inputElement.value;
  if (userInput.length < 3) {
    autocompleteContainer.innerHTML = "";
    return;
  }

  const geocoded = await geocode(userInput);

  const places = [];
  const stops = [];

  for (let result of geocoded) {
    // todo currently working with places does not really work revisit
    //if (result.place) places.push(createAutocompleteItem(result.place));
    //else stops.push(createAutocompleteItem(result.stop));
    stops.push(createAutocompleteItem(result.stop));
  }

  autocompleteContainer.replaceChildren(...stops);
}

export class Config {
  #elements = {};

  #callbacks = {
    submit: (from, to, date) => {},
  };

  /**
   * @param {Element} container
   * @param {DateTime} calendarMin
   * @param {DateTime} calendarMax
   */
  constructor(container, calendarMin, calendarMax) {
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
      await setAutocompleteOptions(
        this.#elements.from,
        this.#elements.fromAutocomplete,
      );
    });

    this.#elements.to.addEventListener("input", async (e) => {
      await setAutocompleteOptions(
        this.#elements.to,
        this.#elements.toAutocomplete,
      );
    });

    this.#elements.date.addEventListener("input", async (e) => {
      this.#checkSubmitPossible();
    });

    this.#elements.fromAutocomplete.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      this.#elements.from.value = li.dataset.name;
      this.#elements.from.dataset.data = li.dataset.data;
      this.#elements.fromAutocomplete.innerHTML = "";

      this.#checkSubmitPossible();
    });

    this.#elements.toAutocomplete.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      this.#elements.to.value = li.dataset.name;
      this.#elements.to.dataset.data = li.dataset.data;
      this.#elements.toAutocomplete.innerHTML = "";

      this.#checkSubmitPossible();
    });

    container.addEventListener("submit", (e) => {
      e.preventDefault();

      this.#callbacks.submit(
        JSON.parse(this.#elements.from.dataset.data),
        JSON.parse(this.#elements.to.dataset.data),
        DateTime.fromISO(this.#elements.date.value),
      );
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  /**
   * @returns date
   */
  get date() {
    const val = this.#elements.date.value;
    if (val) return DateTime.fromISO(val);
    else return null;
  }

  /**
   * @param {DateTime} date
   */
  set date(date) {
    this.#elements.date.value = date.toISODate();
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
    const hasFrom = this.#elements.from.dataset.data;
    const hasTo = this.#elements.to.dataset.data;
    const hasDate = this.#elements.date.value;
    this.#elements.submit.disabled = !hasFrom || !hasTo || !hasDate;
  }
}
