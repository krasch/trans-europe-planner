import { geocodePlace, geocodeStop } from "script/motis/client.js";
import { DateTime } from "script/types/dateTime.js";
import { createElementFromTemplate } from "script/util.js";

/**
 * @param {'stop' | 'place'} kind
 * @param {{name: string, location: string}} data
 * @returns {HTMLElement}
 */
function createAutocompleteItem(kind, data) {
  const template = `template-config-autocomplete-${kind}`;

  const element = createElementFromTemplate(template, {
    span: { innerHTML: data.name },
  });
  element.dataset.name = data.name;
  element.dataset.location = data.location;
  return element;
}

/**
 * @param {HTMLInputElement} inputElement
 * @param {HTMLUListElement} autocompleteContainer
 */
async function setAutocompleteOptions(inputElement, autocompleteContainer) {
  const userInput = inputElement.value;
  if (userInput.length < 3) {
    autocompleteContainer.innerHTML = "";
    return;
  }

  const places = await geocodePlace(userInput);
  const stops = await geocodeStop(userInput);

  const elements1 = places.map((p) => createAutocompleteItem("place", p));
  const elements2 = stops.map((s) => createAutocompleteItem("stop", s));
  autocompleteContainer.replaceChildren(...elements1.concat(elements2));
}

/**
 * @param {HTMLLIElement} item
 * @param {HTMLInputElement} inputElement
 * @param {HTMLUListElement} autocompleteContainer
 */
async function submitChosen(item, inputElement, autocompleteContainer) {
  inputElement.value = item.dataset.name;
  inputElement.dataset.location = item.dataset.location;
  autocompleteContainer.innerHTML = "";
}

export class Config {
  #elements = {};

  #callbacks = {
    submit: (from, to, date) => {},
  };

  constructor(container) {
    this.#elements = {
      from: container.querySelector("#config-from"),
      fromAutocomplete: container.querySelector("#config-from-values"),
      to: container.querySelector("#config-to"),
      toAutocomplete: container.querySelector("#config-to-values"),
      date: container.querySelector("#config-date"),
      submit: container.querySelector("button"),
    };

    const today = DateTime.now().startOf("day");
    this.#elements.date.min = today.toISODate();
    this.#elements.date.max = today.plus({ days: 3 * 30 }).toISODate();

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

      submitChosen(li, this.#elements.from, this.#elements.fromAutocomplete);
      this.#checkSubmitPossible();
    });

    this.#elements.toAutocomplete.addEventListener("click", (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      submitChosen(li, this.#elements.to, this.#elements.toAutocomplete);
      this.#checkSubmitPossible();
    });

    container.addEventListener("submit", (e) => {
      e.preventDefault();

      this.#callbacks.submit(
        this.#elements.from.dataset.location,
        this.#elements.to.dataset.location,
        DateTime.fromISO(this.#elements.date.value),
      );
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
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
    const hasFrom = this.#elements.from.dataset.location;
    const hasTo = this.#elements.to.dataset.location;
    const hasDate = this.#elements.date.value;
    this.#elements.submit.disabled = !hasFrom || !hasTo || !hasDate;
  }
}
