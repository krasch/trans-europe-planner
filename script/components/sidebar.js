class Sidebar {
  #initialUpdate = true;

  #borderRadius;

  // relevant HTML elements
  #logo;
  #datePicker;
  #calendar;
  #showSidebarButton;
  #hideSidebarButton;

  // state
  #datePickerShouldBeVisible = false;
  #calendarShouldBeVisible = false;
  #collapsed = false;

  constructor(container) {
    this.#borderRadius = window
      .getComputedStyle(container)
      .getPropertyValue("--border-radius");

    this.#logo = container.querySelector(".logo");
    this.#datePicker = container.querySelector(".header");
    this.#calendar = container.querySelector(".content");
    this.#showSidebarButton = container.querySelector("#show-sidebar");
    this.#hideSidebarButton = container.querySelector("#hide-sidebar");

    container.addEventListener("click", (e) => {
      if (e.target.id === this.#hideSidebarButton.id) {
        this.#collapsed = true;

        this.#updateView();
      }
      if (e.target.id === this.#showSidebarButton.id) {
        this.#collapsed = false;
        this.#updateView();
      }
    });
  }

  updateView(hasDate, hasActiveJourney) {
    if (this.#initialUpdate) {
      this.#setVisible(this.#logo);
      this.#initialUpdate = false;
    }

    this.#datePickerShouldBeVisible = hasActiveJourney;
    this.#calendarShouldBeVisible = hasActiveJourney && hasDate;
    this.#updateView();
  }

  #updateView() {
    if (this.#collapsed) {
      this.#hideDatePicker();
      this.#hideCalendar();
      return;
    }

    if (this.#datePickerShouldBeVisible) this.#showDatePicker();
    else this.#hideDatePicker();

    if (this.#calendarShouldBeVisible) this.#showCalendar();
    else this.#hideCalendar();
  }

  #showDatePicker() {
    if (this.#isVisible(this.#datePicker)) return; // nothing to do

    this.#removeBorderRadius(this.#logo);
    this.#setVisible(this.#datePicker);
    this.#setInvisible(this.#showSidebarButton);

    this.#slideIn(this.#datePicker, () => {
      this.#setVisible(this.#hideSidebarButton);
    });
  }

  #hideDatePicker() {
    if (!this.#isVisible(this.#datePicker)) return; // nothing to do

    this.#setInvisible(this.#hideSidebarButton);

    this.#slideOut(this.#datePicker, () => {
      this.#addBorderRadius(this.#logo);
      this.#setInvisible(this.#datePicker);
      this.#setVisible(this.#showSidebarButton);
    });
  }

  #showCalendar() {
    if (this.#isVisible(this.#calendar)) return; // nothing to do

    this.#removeBorderRadius(this.#datePicker);
    this.#slideIn(this.#calendar);
    this.#setVisible(this.#calendar);
  }

  #hideCalendar() {
    if (!this.#isVisible(this.#calendar)) return; // nothing to do

    this.#slideOut(this.#calendar, () => {
      this.#addBorderRadius(this.#datePicker);
      this.#setInvisible(this.#calendar);
    });
  }

  #isVisible(element) {
    return !element.classList.contains("hidden");
  }

  #setVisible(element) {
    element.classList.remove("hidden");
  }

  #setInvisible(element) {
    element.classList.add("hidden");
  }

  #slideIn(element, onFinish = () => {}) {
    const width = window.getComputedStyle(element).getPropertyValue("width");

    const animation = element.animate([{ width: "0" }, { width: width }], {
      duration: 200,
      iterations: 1,
    });
    animation.onfinish = onFinish;
  }

  #slideOut(element, onFinish = () => {}) {
    const width = window.getComputedStyle(element).getPropertyValue("width");

    const animation = element.animate([{ width: width }, { width: 0 }], {
      duration: 200,
      iterations: 1,
    });
    animation.onfinish = onFinish;
  }

  #removeBorderRadius(element) {
    element.style.borderBottomRightRadius = 0;
  }

  #addBorderRadius(element) {
    element.style.borderBottomRightRadius = this.#borderRadius;
  }
}
