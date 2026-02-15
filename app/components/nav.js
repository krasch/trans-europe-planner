/**
 * for all elements, set exactly the ones in selectedNames to ".selected"
 * @param {Object.<string, Element>} elements
 * @param {string[]} selectedNames
 */
function _setSelected(elements, selectedNames) {
  for (let name in elements) {
    if (selectedNames.includes(name)) elements[name].classList.add("selected");
    else elements[name].classList.remove("selected");
  }
}

export function initNavigation() {
  const tabs = {
    map: document.querySelector("#nav-tab-map"),
    config: document.querySelector("#nav-tab-config"),
    calendar: document.querySelector("#nav-tab-calendar"),
    perlschnur: document.querySelector("#nav-tab-perlschnur"),
  };

  const content = {
    config: document.querySelector("#config"),
    calendar: document.querySelector("#calendar"),
    perlschnur: document.querySelector("#perlschnur"),
  };

  // initial load
  _setSelected(tabs, ["config"]);
  _setSelected(content, ["config"]);

  tabs.config.addEventListener("click", (e) => {
    _setSelected(tabs, ["config"]);
    _setSelected(content, ["config"]);
  });

  // this tab is only available on mobile
  // no content is selected because map is in background
  tabs.map.addEventListener("click", (e) => {
    _setSelected(tabs, ["map"]);
    _setSelected(content, []);
  });

  tabs.calendar.addEventListener("click", (e) => {
    _setSelected(tabs, ["calendar"]);
    _setSelected(content, ["calendar"]);
  });

  tabs.perlschnur.addEventListener("click", (e) => {
    _setSelected(tabs, ["perlschnur"]);
    _setSelected(content, ["perlschnur"]);
  });
}

export async function showLandingPage() {
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

export function showSidebar() {
  const sidebar = document.querySelector("main");
  sidebar.classList.remove("closed");
}
