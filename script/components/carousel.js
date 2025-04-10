// todo read this article to add accessibility:
// https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13

export class Carousel {
  #container;

  #items;
  #dots;

  constructor(container) {
    this.#container = container;

    this.#items = Array.from(document.querySelectorAll(".carousel-item"));
    this.#dots = Array.from(document.querySelectorAll(".carousel-dot"));

    const pagination = this.#container.querySelector("#pagination");

    pagination.addEventListener("click", (e) => {
      const closest = e.target.closest(".carousel-dot");
      if (closest) this.#setActive(closest.dataset.item);
    });
  }

  #setActive(item) {
    // set all currently active things (items and dots) to inactive
    for (let el of this.#container.querySelectorAll(".active"))
      el.classList.remove("active");

    // set the new one to active
    const idx = Number(item) - 1;
    this.#items[idx].classList.add("active");
    this.#dots[idx].classList.add("active");
  }
}
