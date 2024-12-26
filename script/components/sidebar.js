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
    this.#removeBorderRadius(this.#logoContainer);
    this.#slideIn(this.#datePickerContainer);
  }

  #hideDatePicker() {
    this.#slideOut(this.#datePickerContainer);
    this.#logoContainer.style.borderBottomRightRadius = this.#borderRadius;
  }

  #showCalendar() {
    this.#removeBorderRadius(this.#datePickerContainer);
    this.#slideIn(this.#calendarContainer);
  }

  #hideCalendar() {
    this.#slideOut(this.#calendarContainer);
    this.#addBorderRadius(this.#datePickerContainer);
  }

  #slideIn(element) {
    const width = window.getComputedStyle(element).getPropertyValue("width");

    element.classList.remove("hidden");
    element.animate([{ width: "0" }, { width: width }], {
      duration: 200,
      iterations: 1,
    });
  }

  #slideOut(element) {
    const width = window.getComputedStyle(element).getPropertyValue("width");

    const animation = element.animate([{ width: width }, { width: 0 }], {
      duration: 200,
      iterations: 1,
    });
    animation.onfinish = () => element.classList.add("hidden");
  }

  #removeBorderRadius(element) {
    element.style.borderBottomRightRadius = 0;
  }

  #addBorderRadius(element) {
    element.style.borderBottomRightRadius = this.#borderRadius;
  }
}
