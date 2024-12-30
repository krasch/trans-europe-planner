class Perlschnur {
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

  updateView(data) {
    const elements = [];

    elements.push(this.#createSummary(data.summary));

    for (let i in data.connections) {
      elements.push(this.#createConnection(data.connections[i]));
      if (Number(i) < data.connections.length - 1)
        elements.push(this.#createTransfer(data.transfers[i]));
    }

    this.#container.replaceChildren(...elements);
  }

  #createSummary(summary) {
    const element = createElementFromTemplate("template-perlschnur-summary", {
      ".total-time": { innerText: summary.totalTime },
      ".from": { innerText: summary.from },
      ".to": { innerText: summary.to },
      ".via": { innerText: summary.via },
    });
    return element;
  }

  #createConnection(connection) {
    const element = createElementFromTemplate(
      "template-perlschnur-connection",
      {
        ".connection-icon": { src: `images/icons/${connection.type}.svg` },
        ".connection-number": { innerText: connection.name },
        ".connection-travel-time": { innerText: connection.travelTime },
      },
    );
    element.style.setProperty("--color", connection.color);

    const collapsed = connection.stops.length - 2;

    const ul = element.querySelector("ul");
    for (let i in connection.stops) {
      if (i === "1" && collapsed > 1) {
        const li = createElementFromTemplate("template-perlschnur-collapse", {
          ".count": { innerText: collapsed },
        });
        ul.appendChild(li);
      }

      const li = createElementFromTemplate("template-perlschnur-stop", {
        ".time": { innerText: connection.stops[i].time },
        ".date": { innerText: connection.stops[i].date || "" },
        ".station": { innerText: connection.stops[i].station },
      });
      ul.appendChild(li);
    }

    if (collapsed > 1) this.#collapse(element);

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
