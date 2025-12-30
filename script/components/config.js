import { geocodePlace, geocodeStop } from "script/data/motis/client.js";
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

    async function setSelected(e, inputElement, autocompleteContainer) {
      inputElement.value = e.target.dataset.name;
      inputElement.dataset.location = e.target.dataset.location;
      autocompleteContainer.innerHTML = "";
    }

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

    this.#elements.fromAutocomplete.addEventListener("click", (e) => {
      if (e.target.tagName !== "LI") return;
      setSelected(e, this.#elements.from, this.#elements.fromAutocomplete);
    });

    this.#elements.toAutocomplete.addEventListener("click", (e) => {
      if (e.target.tagName !== "LI") return;
      setSelected(e, this.#elements.to, this.#elements.toAutocomplete);
    });

    container.addEventListener("submit", (e) => {
      e.preventDefault();

      this.#callbacks.submit(
        this.#elements.from.dataset.location,
        this.#elements.to.dataset.location,
        DateTime.fromISO(this.#elements.date.value),
      );
    });

    /*
    const today = DateTime.fromISO("2025-08-11"); //DateTime.now().startOf("day");
    this.#start = today.plus({ days: 1 });
    this.#end = today.plus({ days: 3 * 30 });
    this.#default = today.plus({ days: 30 });*/
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  lock() {
    for (let key in this.#elements) this.#elements[key].disabled = true;
  }

  unlock() {
    for (let key in this.#elements) this.#elements[key].disabled = false;
  }
}
