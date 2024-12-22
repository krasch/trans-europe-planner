// https://stackoverflow.com/a/3818198
function incDecDate(date, deltaDays) {
  const result = date.setDate(date.getDate() + deltaDays);
  return new Date(result);
}

class Sidebar {
  #container;

  #datePickerElement;
  #decreaseDateElement;
  #increaseDateElement;

  #callbacks = {
    dateChanged: () => {},
    dateReset: () => {},
  };

  constructor(container) {
    this.#container = container;

    this.#datePickerElement = this.#container.querySelector("input");
    this.#decreaseDateElement = this.#container.querySelector(".decrease-date");
    this.#increaseDateElement = this.#container.querySelector(".increase-date");

    // if doing callback here it won't be heard because .on is done later
    if (this.#currentDate !== null) this.#showArrows();

    this.#container.addEventListener("input", (e) => {
      if (this.#currentDate === null) {
        this.#hideArrows();
        this.#callbacks["dateReset"]();
      } else {
        this.#showArrows();
        this.#callbacks["dateChanged"](this.#currentDate);
      }
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

    if (eventName === "dateChanged" && this.#currentDate !== null)
      this.#callbacks["dateChanged"](this.currentDate);
  }

  updateView(data) {}

  show() {
    this.#container.classList.remove("hidden");
  }

  hide() {
    this.#container.classList.add("hidden");
  }

  get #currentDate() {
    if (this.#datePickerElement.value.length === 0) return null;
    return new Date(this.#datePickerElement.value);
  }

  set #currentDate(value) {
    this.#datePickerElement.value = value.toLocaleDateString("sv");
  }

  #showArrows() {
    for (let arrow of this.#container.querySelectorAll("a"))
      arrow.classList.remove("hidden");
  }

  #hideArrows() {
    for (let arrow of this.#container.querySelectorAll("a"))
      arrow.classList.add("hidden");
  }
}
