export class Layout {
  #initialUpdate = true;

  #borderRadius;

  // relevant HTML elements
  #logo;
  #datePicker;
  sidebar;
  #map;
  #modal;

  // state
  #datePickerShouldBeVisible = false;
  #sidebarShouldBeVisible = false;
  #collapsed = false;

  constructor(container) {
    this.#logo = container.querySelector("#logo");
    this.#datePicker = container.querySelector("#date-picker");
    this.sidebar = container.querySelector("#sidebar");
    this.#map = container.querySelector("#map");
    this.#modal = container.querySelector("#modal");

    this.#borderRadius = "5px";
  }

  updateView(hasDate, hasActiveJourney) {
    if (this.#initialUpdate) {
      this.#setVisible(this.#logo);
      this.#initialUpdate = false;
    }

    this.#datePickerShouldBeVisible = hasActiveJourney;
    this.#sidebarShouldBeVisible = hasActiveJourney && hasDate;
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
      this.#hideSidebar();
      return;
    }

    if (this.#datePickerShouldBeVisible) this.#showDatePicker();
    else this.#hideDatePicker();

    if (this.#sidebarShouldBeVisible) this.#showSidebar();
    else this.#hideSidebar();
  }

  #showDatePicker() {
    if (this.#isVisible(this.#datePicker)) return; // nothing to do

    this.#removeBorderRadius(this.#logo);
    this.#setVisible(this.#datePicker);
    this.#slideIn(this.#datePicker);
  }

  #hideDatePicker() {
    if (!this.#isVisible(this.#datePicker)) return; // nothing to do

    this.#slideOut(this.#datePicker, () => {
      this.#addBorderRadius(this.#logo);
      this.#setInvisible(this.#datePicker);
    });
  }

  #showSidebar() {
    if (this.#isVisible(this.sidebar)) return; // nothing to do

    this.#removeBorderRadius(this.#datePicker);
    this.#slideIn(this.sidebar);
    this.#setVisible(this.sidebar);
  }

  #hideSidebar() {
    if (!this.#isVisible(this.sidebar)) return; // nothing to do

    this.#slideOut(this.sidebar, () => {
      this.#addBorderRadius(this.#datePicker);
      this.#setInvisible(this.sidebar);
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
