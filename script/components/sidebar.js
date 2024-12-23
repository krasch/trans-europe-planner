// https://stackoverflow.com/a/3818198
function incDecDate(date, deltaDays) {
  const result = date.setDate(date.getDate() + deltaDays);
  return new Date(result);
}

function toISOString(date) {
  return date.toLocaleDateString("sv");
}

class Sidebar {
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

    const today = new Date();
    this.#start = incDecDate(today, 1);
    this.#end = incDecDate(today, 3 * 30);

    this.#inputElement.min = toISOString(this.#start);
    this.#inputElement.max = toISOString(this.#end);

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
        this.#currentDate = incDecDate(this.#currentDate, -1);
        this.#callbacks["dateChanged"](this.#currentDate);
      }
      if (e.target.id === "increase-date") {
        this.#currentDate = incDecDate(this.#currentDate, +1);
        this.#callbacks["dateChanged"](this.#currentDate);
      }
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  updateView(data) {}

  show() {
    this.#container.classList.remove("hidden");
  }

  hide() {
    this.#container.classList.add("hidden");
  }

  get currentDate() {
    return this.#currentDate;
  }

  get #currentDate() {
    if (this.#inputElement.value.length === 0) return null;
    return new Date(this.#inputElement.value);
  }

  set #currentDate(value) {
    this.#inputElement.value = toISOString(value);
  }

  #showHideArrows() {
    if (this.#currentDate === null) {
      this.#decreaseDateElement.classList.add("hidden");
      this.#increaseDateElement.classList.add("hidden");
      return;
    }

    if (incDecDate(this.#currentDate, -1) >= this.#start)
      this.#decreaseDateElement.classList.remove("hidden");

    if (incDecDate(this.#currentDate, +1) <= this.#end)
      this.#increaseDateElement.classList.remove("hidden");
  }
}
