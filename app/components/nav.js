export class Navigation {
  #elements;

  constructor() {
    this.#elements = {
      tabs: {
        map: document.querySelector("#nav-tab-map"),
        config: document.querySelector("#nav-tab-config"),
        calendar: document.querySelector("#nav-tab-calendar"),
        perlschnur: document.querySelector("#nav-tab-perlschnur"),
      },

      components: {
        // map does not get an entry here because it is always visible
        config: document.querySelector("#config"),
        calendar: document.querySelector("#calendar"),
        perlschnur: document.querySelector("#perlschnur"),
      },

      landingPage: document.querySelector("dialog"),
      sidebar: document.querySelector("main"),
    };

    this.#elements.tabs.config.addEventListener("click", (e) => {
      this.focusComponent("config");
    });

    this.#elements.tabs.map.addEventListener("click", (e) => {
      this.focusComponent("map");
    });

    this.#elements.tabs.calendar.addEventListener("click", (e) => {
      this.focusComponent("calendar");
    });

    this.#elements.tabs.perlschnur.addEventListener("click", (e) => {
      this.focusComponent("perlschnur");
    });
  }

  showSidebar() {
    this.#elements.sidebar.classList.remove("closed");
  }

  async showLandingPage() {
    const landing = document.querySelector("dialog");

    // using form with submit = "dialog"
    // submit -> automatically closes -> resolves
    const modalClosedPromise = new Promise((resolve) =>
      landing.addEventListener("close", (e) => {
        resolve();
      }),
    );

    landing.show();

    return modalClosedPromise;
  }

  /**
   * @param {string} componentName
   */
  focusComponent(componentName) {
    // set this tab, unset all other tabs
    for (let [name, tab] of Object.entries(this.#elements.tabs)) {
      if (name === componentName) tab.classList.add("selected");
      else tab.classList.remove("selected");
    }

    // make this component visible, make all other invisible
    // for map we don't have anything in this list because map is always visible
    // (on mobile: map is hidden by the other components)
    for (let [name, com] of Object.entries(this.#elements.components)) {
      if (name === componentName) com.classList.add("selected");
      else com.classList.remove("selected");
    }
  }
}
