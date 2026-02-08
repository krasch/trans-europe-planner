import { createElementFromTemplate } from "app/util.js";

/**
 * @typedef {import("app/components/_data/perlschnur.js").PerlschnurStopData} PerlschnurStopData
 * @typedef {import("app/components/_data/perlschnur.js").PerlschnurConnectionData} PerlschnurConnectionData
 **/

/**
 * @param {PerlschnurConnectionData} connection
 * @returns {HTMLElement}
 */
function createConnectionElement(connection) {
  const element = createElementFromTemplate("template-perlschnur-connection", {
    ".": { "data-connection-id": connection.id },
    ".connection-icon": { src: connection.icon },
    ".connection-number": { innerText: connection.name },
    ".connection-travel-time": { innerText: connection.travelTime },
  });
  element.style.setProperty("--color", connection.color);
  return element;
}

/**
 * @param {PerlschnurStopData} stop
 * @returns {HTMLElement}
 */
export function createStopElement(stop) {
  return createElementFromTemplate("template-perlschnur-stop", {
    ".": { "data-stop-id": stop.stopId },
    ".time": { innerText: stop.time },
    ".date": { innerText: stop.date ?? "" },
    ".station": { innerText: stop.stopName },
  });
}

/**
 * @param {Number} numIntermediateSteps
 * @returns {HTMLElement}
 */
function createCollapseElement(numIntermediateSteps) {
  return createElementFromTemplate("template-perlschnur-collapse", {
    ".count": { innerText: numIntermediateSteps },
  });
}

/**
 * @param {String} transferTime
 * @returns {HTMLElement}
 */
function createTransferElement(transferTime) {
  return createElementFromTemplate("template-perlschnur-transfer", {
    ".transfer-time": { innerText: transferTime },
  });
}

export class Perlschnur {
  #container;

  #callbacks = {
    connectionHover: (connectionId, isHover) => {},
    stopHover: (stopId, isHover) => {},
  };

  constructor(container) {
    this.#container = container.querySelector("#perlschnur-inner");

    container.addEventListener("click", (e) => {
      e.preventDefault();

      const stopList = e.target.closest(".perlschnur-stop-list");
      if (stopList) this.#toggleCollapse(stopList);
    });

    container.addEventListener("mouseover", (e) => {
      e.preventDefault();

      const stop = e.target.closest(".perlschnur-stop");
      if (stop) {
        this.setStopHover(stop.dataset.stopId, true);
        this.#callbacks.stopHover(stop.dataset.stopId, true);
      }

      const connection = e.target.closest(".perlschnur-connection");
      if (connection) {
        this.setConnectionHover(connection.dataset.connectionId, true);
        this.#callbacks.connectionHover(connection.dataset.connectionId, true);
      }
    });

    container.addEventListener("mouseout", (e) => {
      e.preventDefault();

      const stop = e.target.closest(".perlschnur-stop");
      if (stop) {
        this.setStopHover(stop.dataset.stopId, false);
        this.#callbacks.stopHover(stop.dataset.stopId, false);
      }

      const connection = e.target.closest(".perlschnur-connection");
      if (connection) {
        this.setConnectionHover(connection.dataset.connectionId, false);
        this.#callbacks.connectionHover(connection.dataset.connectionId, false);
      }
    });
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  /**
   * @param {PerlschnurConnectionData[]} connections
   */
  updateView(connections) {
    const children = [];
    for (let i in connections) {
      const connection = connections[i];

      // if too many stops, insert special "collapse" element after first stop
      // todo make it collapse for > 4, must change first/last child css logic
      const stops = connection.stops.map(createStopElement);
      if (stops.length > 2)
        stops.splice(1, 0, createCollapseElement(stops.length - 2));

      const connectionElement = createConnectionElement(connections[i]);
      connectionElement
        .querySelector(".perlschnur-stop-list")
        .replaceChildren(...stops);

      // add both connection and transfer to stop list
      children.push(connectionElement);
      if (connection.transferTime)
        children.push(createTransferElement(connection.transferTime));
    }

    this.#container.replaceChildren(...children);
  }

  /**
   * @param {string} stopId
   * @param {boolean} isHover
   */
  setStopHover(stopId, isHover) {
    const selector = `.perlschnur-stop[data-stop-id="${stopId}"]`;
    this.#setAllHover(this.#container.querySelectorAll(selector), isHover);
  }

  /**
   * @param {string} connectionId
   * @param {boolean} isHover
   */
  setConnectionHover(connectionId, isHover) {
    const selector = `.perlschnur-connection[data-connection-id="${connectionId}"]`;
    this.#setAllHover(this.#container.querySelectorAll(selector), isHover);
  }

  /**
   * @param {HTMLElement[]} elements
   * @param {boolean} isHover
   */
  #setAllHover(elements, isHover) {
    for (let element of elements) {
      if (isHover) element.classList.add("hover");
      else element.classList.remove("hover");
    }
  }

  /**
   * @param {HTMLElement} stopList
   */
  #toggleCollapse(stopList) {
    if (stopList.dataset.collapsed === "collapsed")
      stopList.dataset.collapsed = "";
    else stopList.dataset.collapsed = "collapsed";
  }
}
