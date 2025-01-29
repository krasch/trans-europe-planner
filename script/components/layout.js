export class Layout {
  #initialUpdate = true;
  #beforeFirstJourney = true;

  #isMobile;

  // relevant HTML elements
  #elements = {};

  constructor(container, isMobile) {
    this.#elements = {
      logo: container.querySelector("#logo"),
      nav: container.querySelector("nav"),
      journey: container.querySelector("#journey"),
      map: container.querySelector("#map"),
      config: container.querySelector("#config"),
      modal: container.querySelector("#modal"),
    };

    this.#isMobile = isMobile;
  }

  updateView(hasDate, hasActiveJourney) {
    if (this.#initialUpdate) {
      this.#setVisible(this.#elements.logo);

      // on mobile we want to see all elements but some tabs will be empty
      if (this.#isMobile.matches) this.#showAllElements(false);

      this.#initialUpdate = false;
    }

    if (hasDate && hasActiveJourney && this.#beforeFirstJourney) {
      if (this.#isMobile.matches) this.#showAllTabs();
      else this.#showAllElements();

      this.#beforeFirstJourney = false;
    }
  }

  showModal() {
    this.#elements.map.style.opacity = "30%";
    this.#setVisible(this.#elements.modal);
  }

  #showAllElements(animation = false) {
    this.#removeBorderRadius(this.#elements.logo);

    if (animation) {
      this.#slideIn(this.#elements.config);
      this.#slideIn(this.#elements.nav);
      this.#slideIn(this.#elements.journey);
    }

    this.#setVisible(this.#elements.config);
    this.#setVisible(this.#elements.nav);
    this.#setVisible(this.#elements.journey);
  }

  #showAllTabs() {
    console.log("hallo");
    for (let tab of this.#elements.nav.querySelectorAll("a"))
      tab.classList.remove("tab-hidden");
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

  #removeBorderRadius(element) {
    element.style.borderBottomRightRadius = 0;
  }
}
