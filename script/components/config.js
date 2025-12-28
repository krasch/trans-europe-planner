import { DateTime } from "script/types/dateTime.js";

export class Config {
  #elements = {};

  #callbacks = {
    submit: (from, to, date) => {},
  };

  constructor(container) {
    this.#elements = {
      from: container.querySelector("#config-from"),
      to: container.querySelector("#config-to"),
      date: container.querySelector("#config-date"),
      submit: container.querySelector("button"),
    };

    container.addEventListener("submit", (e) => {
      e.preventDefault();
      this.#callbacks.submit(
        this.#elements.from.value,
        this.#elements.to.value,
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
