import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";

export class Datepicker {
  #container;

  #inputElement;
  #decreaseDateElement;
  #increaseDateElement;

  #start;
  #end;

  #callbacks = {
    dateChanged: () => {},
    dateReset: () => {},
  };

  constructor(container) {
    this.#container = container;

    this.#inputElement = this.#container.querySelector("input");
    this.#decreaseDateElement = this.#container.querySelector("#decrease-date");
    this.#increaseDateElement = this.#container.querySelector("#increase-date");

    const today = DateTime.now().startOf("day");
    this.#start = today.plus({ days: 1 });
    this.#end = today.plus({ days: 3 * 30 });

    this.#inputElement.min = this.#start.toISODate();
    this.#inputElement.max = this.#end.toISODate();

    // previously picked date might still be set after reloading the page
    if (this.#currentDate !== null) {
      // it is no longer within the valid range, reset it
      if (this.#currentDate < this.#start || this.#currentDate > this.#end)
        this.#currentDate = null;
      // it is still within the valid range, keep it
      else {
        this.#showHideArrows();
      }
    }

    this.#container.addEventListener("input", (e) => {
      this.#showHideArrows();
      this.#callbacks["dateChanged"](this.#currentDate);
    });

    this.#container.addEventListener("click", (e) => {
      if (e.target.id === "decrease-date") {
        this.#currentDate = this.#currentDate.minus({ days: 1 });
        this.#callbacks["dateChanged"](this.#currentDate);
        this.#showHideArrows();
      }
      if (e.target.id === "increase-date") {
        this.#currentDate = this.#currentDate.plus({ days: 1 });
        this.#callbacks["dateChanged"](this.#currentDate);
        this.#showHideArrows();
      }
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {}

  get currentDate() {
    return this.#currentDate;
  }

  get #currentDate() {
    if (this.#inputElement.value.length === 0) return null;
    return DateTime.fromISO(this.#inputElement.value);
  }

  set #currentDate(value) {
    if (value === null) this.#inputElement.value = null;
    else this.#inputElement.value = value.toISODate();
  }

  #showHideArrows() {
    if (this.#currentDate === null) {
      this.#decreaseDateElement.classList.add("hidden");
      this.#increaseDateElement.classList.add("hidden");
      return;
    }

    const diffStart = this.currentDate.diff(this.#start, "days").as("days");
    const diffEnd = this.#end.diff(this.currentDate, "days").as("days");

    // todo only add/remove if actually changes?
    if (diffStart >= 1) this.#decreaseDateElement.classList.remove("hidden");
    else this.#decreaseDateElement.classList.add("hidden");

    if (diffEnd >= 1) this.#increaseDateElement.classList.remove("hidden");
    else this.#increaseDateElement.classList.add("hidden");
  }
}
