class Sidebar {
  #initialUpdate = true;

  #borderRadius;

  // relevant HTML elements
  #logo;
  #datePicker;
  #journeyDetails;
  #showSidebarButton;
  #hideSidebarButton;

  // state
  #datePickerShouldBeVisible = false;
  #calendarShouldBeVisible = false;
  #collapsed = false;

  constructor(container) {
    this.#logo = container.querySelector("#logo");
    this.#showSidebarButton = container.querySelector("#show-sidebar");
    this.#hideSidebarButton = container.querySelector("#hide-sidebar");
    this.#datePicker = container.querySelector("#date-picker");
    this.#journeyDetails = container.querySelector("#journey-details");

    this.#borderRadius = window
      .getComputedStyle(this.#logo)
      .getPropertyValue("--border-radius");

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
      this.#hideJourneyDetails();
      return;
    }

    if (this.#datePickerShouldBeVisible) this.#showDatePicker();
    else this.#hideDatePicker();

    if (this.#calendarShouldBeVisible) this.#showJourneyDetails();
    else this.#hideJourneyDetails();
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

  #showJourneyDetails() {
    if (this.#isVisible(this.#journeyDetails)) return; // nothing to do

    this.#removeBorderRadius(this.#datePicker);
    this.#slideIn(this.#journeyDetails);
    this.#setVisible(this.#journeyDetails);
  }

  #hideJourneyDetails() {
    if (!this.#isVisible(this.#journeyDetails)) return; // nothing to do

    this.#slideOut(this.#journeyDetails, () => {
      this.#addBorderRadius(this.#datePicker);
      this.#setInvisible(this.#journeyDetails);
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
