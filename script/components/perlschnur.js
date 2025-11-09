import { createElementFromTemplate, updateElement } from "script/util.js";

// todo streamline icons with calendar

// todo rename whole thing to Summary or SummaryWithPerlschnur or Overview or something
// the perlschnur is just one part of this, so naming is very confusing
export class Perlschnur {
  #container;

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
        ".station": { innerText: connection.stops[i].station },
      });
      ul.appendChild(li);
    }

    if (intermediateSteps > 1) this.#collapse(element);

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
