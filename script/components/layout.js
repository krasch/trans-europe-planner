export class Layout {
  #initialUpdate = true;

  #borderRadius;

  // relevant HTML elements
  #logo;
  #datePicker;
  #journeyDetails;
  #showSidebarButton;
  #hideSidebarButton;
  #map;
  #modal;

  // state
  #datePickerShouldBeVisible = false;
  #journeyDetailsShouldBeVisible = false;
  #collapsed = false;

  constructor(container) {
    this.#logo = container.querySelector("#logo");
    this.#datePicker = container.querySelector("#date-picker");
    this.#journeyDetails = container.querySelector("#journey-details");
    this.#showSidebarButton = container.querySelector("#show-sidebar");
    this.#hideSidebarButton = container.querySelector("#hide-sidebar");
    this.#map = container.querySelector("#map");
    this.#modal = container.querySelector("#modal");

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
    this.#journeyDetailsShouldBeVisible = hasActiveJourney && hasDate;
    this.#updateView();
  }

  showModal() {
    this.#map.style.opacity = "30%";
    this.#setInvisible(this.#logo);
    this.#setVisible(this.#modal);
  }

  #updateView() {
    if (this.#collapsed) {
      this.#hideDatePicker();
      this.#hideJourneyDetails();
      return;
    }

    if (this.#datePickerShouldBeVisible) this.#showDatePicker();
    else this.#hideDatePicker();

    if (this.#journeyDetailsShouldBeVisible) this.#showJourneyDetails();
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

    for (let e of element.children) this.#setInvisible(e);

    const animation = element.animate([{ width: "0" }, { width: width }], {
      duration: 300,
      iterations: 1,
    });
    animation.onfinish = () => {
      for (let e of element.children) this.#setVisible(e);
      onFinish();
    };
  }

  #slideOut(element, onFinish = () => {}) {
    const width = window.getComputedStyle(element).getPropertyValue("width");

    for (let e of element.children) this.#setInvisible(e);

    const animation = element.animate([{ width: width }, { width: 0 }], {
      duration: 300,
      iterations: 1,
    });
    animation.onfinish = () => {
      for (let e of element.children) this.#setVisible(e);
      onFinish();
    };
  }

  #removeBorderRadius(element) {
    element.style.borderBottomRightRadius = 0;
  }

  #addBorderRadius(element) {
    element.style.borderBottomRightRadius = this.#borderRadius;
  }
}
