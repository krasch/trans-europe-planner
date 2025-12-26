import { createElementFromTemplate } from "script/util.js";

function createConnectionElement(connection) {
  const element = createElementFromTemplate("template-perlschnur-connection", {
    ".connection-icon": { src: connection.icon },
    ".connection-number": { innerText: connection.name },
    ".connection-travel-time": { innerText: connection.travelTime },
  });
  element.style.setProperty("--color", connection.color);
  element.dataset.connectionId = connection.id;
  return element;
}

function createStopElement(stop) {
  const li = createElementFromTemplate("template-perlschnur-stop", {
    ".time": { innerText: stop.time },
    ".date": { innerText: stop.date ?? "" },
    ".station": { innerText: stop.stopName },
    "data-stop-id": stop.stopId,
  });
  li.dataset.stopId = stop.stopId;
  return li;
}

/**
 * @param {Number} numIntermediateSteps
 */
function createCollapseElement(numIntermediateSteps) {
  return createElementFromTemplate("template-perlschnur-collapse", {
    ".count": { innerText: numIntermediateSteps },
  });
}

function createTransferElement(transfer) {
  return createElementFromTemplate("template-perlschnur-transfer", {
    ".transfer-time": { innerText: transfer.time },
  });
}

// todo collapse by clicking on connection body, intermediate steps get "collapses" class instead of hidden

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
   * @typedef {import("script/data/components/perlschnur.js").PerlschnurConnection} PerlschnurConnection
   * @typedef {import("script/data/components/perlschnur.js").PerlschnurTransfer} PerlschnurTransfer
   *
   * @param {object} data
   * @param {PerlschnurConnection[]} data.connections
   * @param {PerlschnurTransfer[]} data.transfers
   */
  updateView(data) {
    const children = [];
    for (let i in data.connections) {
      const connection = data.connections[i];
      const transfer = data.transfers[i];

      // if too many stops, insert special "collapse" element after first stop
      const stops = connection.stops.map(createStopElement);
      if (stops.length > 4)
        stops.splice(1, 0, createCollapseElement(stops.length - 4));

      const connectionElement = createConnectionElement(data.connections[i]);
      connectionElement
        .querySelector(".perlschnur-stop-list")
        .replaceChildren(...stops);

      // add both connection and transfer to stop list
      children.push(connectionElement);
      if (transfer) children.push(createTransferElement(data.transfers));
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
