class Sidebar {
  #borderRadius;

  #logoContainer;
  #datePickerContainer;
  #calendarContainer;

  constructor(container) {
    this.#borderRadius = window
      .getComputedStyle(container)
      .getPropertyValue("--border-radius");

    this.#logoContainer = container.querySelector(".logo");
    this.#datePickerContainer = container.querySelector(".header");
    this.#calendarContainer = container.querySelector(".content");
  }

  updateView(hasDate, hasActiveJourney) {
    const hasBoth = hasDate && hasActiveJourney;

    if (hasActiveJourney && !this.#datePickerCurrentlyVisible) {
      this.#showDatePicker();
    } else if (!hasActiveJourney && this.#datePickerCurrentlyVisible) {
      this.#hideDatePicker();
    }

    if (hasBoth && !this.#calendarCurrentlyVisible) {
      this.#showCalendar();
    } else if (!hasBoth && this.#calendarCurrentlyVisible) {
      this.#hideCalendar();
    }
  }

  get #datePickerCurrentlyVisible() {
    return !this.#datePickerContainer.classList.contains("hidden");
  }

  get #calendarCurrentlyVisible() {
    return !this.#calendarContainer.classList.contains("hidden");
  }

  #showDatePicker() {
    this.#datePickerContainer.classList.remove("hidden");
    this.#logoContainer.style.borderBottomRightRadius = 0;
  }

  #hideDatePicker() {
    this.#datePickerContainer.classList.add("hidden");
    this.#logoContainer.style.borderBottomRightRadius = this.#borderRadius;
  }

  #showCalendar() {
    this.#calendarContainer.classList.remove("hidden");
    this.#datePickerContainer.style.borderBottomRightRadius = 0;
  }

  #hideCalendar() {
    this.#calendarContainer.classList.add("hidden");
    this.#datePickerContainer.style.borderBottomRightRadius =
      this.#borderRadius;
  }
}
