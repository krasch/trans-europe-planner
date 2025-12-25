import { createElementFromTemplate, updateElement } from "script/util.js";

// todo streamline icons with calendar
// todo bug; only one of the transfer stop circles hovers
// todo collapse by clicking on connection body, intermediate steps get "collapses" class instead of hidden

export class Perlschnur {
  #container;

  #idToConnection;
  #idToStop;

  #callbacks = {
    connectionHover: (connectionId, isHover) => {},
    stopHover: (stopId, isHover) => {},
  };

  constructor(container) {
    this.#container = container;

    container.addEventListener("click", (e) => {
      if (e.target.classList.contains("connection-plus")) {
        this.#expand(e.target.parentElement.parentElement);
      }
      if (e.target.classList.contains("connection-minus")) {
        this.#collapse(e.target.parentElement.parentElement);
      }
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
   * @typedef {import("script/data/components/perlschnur.js").ItinerarySummary} ItinerarySummary
   * @typedef {import("script/data/components/perlschnur.js").PerlschnurConnection} PerlschnurConnection
   * @typedef {import("script/data/components/perlschnur.js").PerlschnurTransfer} PerlschnurTransfer
   *
   * @param {object} data
   * @param {ItinerarySummary} data.summary
   * @param {PerlschnurConnection[]} data.connections
   * @param {PerlschnurTransfer[]} data.transfers
   */
  updateView(data) {
    this.#idToConnection = new Map();
    this.#idToStop = new Map();

    updateElement(this.#container, {
      ".total-time": { innerText: data.summary.totalTime },
      ".from": { innerText: data.summary.from },
      ".to": { innerText: data.summary.to },
      ".via": { innerText: data.summary.via },
    });

    const elements = [];
    for (let i in data.connections) {
      elements.push(this.#createConnection(data.connections[i]));
      if (Number(i) < data.connections.length - 1)
        elements.push(this.#createTransfer(data.transfers[i]));
    }

    this.#container.querySelector("#perlschnur").replaceChildren(...elements);
  }

  setStopHover(stopId, isHover) {
    // can be undefined if hovering in map over inactive itinerary
    const stop = this.#idToStop.get(stopId);
    if (!stop) return;

    if (isHover) stop.classList.add("hover");
    else stop.classList.remove("hover");
  }

  setConnectionHover(connectionId, isHover) {
    // can be undefined if hovering in map over inactive itinerary
    const connection = this.#idToConnection.get(connectionId);
    if (!connection) return;

    if (isHover) connection.classList.add("hover");
    else connection.classList.remove("hover");
  }

  #createConnection(connection) {
    const element = createElementFromTemplate(
      "template-perlschnur-connection",
      {
        ".connection-icon": { src: connection.icon },
        ".connection-number": { innerText: connection.name }, // todo is this correct?
        ".connection-travel-time": { innerText: connection.travelTime },
      },
    );
    element.style.setProperty("--color", connection.color);
    element.dataset.connectionId = connection.id;

    const intermediateSteps = connection.stops.length - 2;

    const ul = element.querySelector("ul");
    for (let i in connection.stops) {
      if (i === "1" && intermediateSteps > 1) {
        const li = createElementFromTemplate("template-perlschnur-collapse", {
          ".count": { innerText: intermediateSteps },
        });
        ul.appendChild(li);
      }

      const li = createElementFromTemplate("template-perlschnur-stop", {
        ".time": { innerText: connection.stops[i].time },
        ".date": { innerText: connection.stops[i].date ?? "" },
        ".station": { innerText: connection.stops[i].stopName },
      });
      li.dataset.stopId = connection.stops[i].stopId;
      ul.appendChild(li);

      this.#idToStop.set(connection.stops[i].stopId, li);
    }

    if (intermediateSteps > 1) this.#collapse(element);

    this.#idToConnection.set(connection.id, element);
    return element;
  }

  #createTransfer(transfer) {
    const element = createElementFromTemplate("template-perlschnur-transfer", {
      ".transfer-time": { innerText: transfer.time },
    });
    return element;
  }

  #expand(connection) {
    const ul = connection.querySelector("ul");
    for (let i = 2; i < ul.children.length - 1; i++)
      ul.children[i].classList.remove("hidden");
    ul.children[1].classList.add("hidden");

    connection.querySelector(".connection-plus").classList.add("hidden");
    connection.querySelector(".connection-minus").classList.remove("hidden");
  }

  #collapse(connection) {
    const ul = connection.querySelector("ul");
    for (let i = 1; i < ul.children.length - 1; i++)
      ul.children[i].classList.add("hidden");
    ul.children[1].classList.remove("hidden");

    connection.querySelector(".connection-plus").classList.remove("hidden");
    connection.querySelector(".connection-minus").classList.add("hidden");
  }
}
