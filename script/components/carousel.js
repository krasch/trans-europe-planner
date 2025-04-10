// todo read this article to add accessibility:
// https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13

export class Carousel {
  #slidesContainer;
  #dotsContainer;

  #slides;
  #dots;

  #current;

  constructor(container, initialPosition = 2) {
    this.#slidesContainer = container.querySelector("#slides");
    this.#slides = this.#slidesContainer.querySelectorAll("*");

    this.#dotsContainer = container.querySelector("#pagination");
    this.#dots = this.#dotsContainer.querySelectorAll("img");

    this.#scrollTo(initialPosition);

    this.#slidesContainer.addEventListener("scroll", () => this.#updateState());
    this.#dotsContainer.addEventListener("click", (e) => {
      const closest = e.target.closest("img");
      if (!closest) return;

      const idx = Number(closest.dataset.slide) - 1;
      this.#scrollTo(idx);
    });
  }

  get #slideWidth() {
    return this.#slides[0].offsetWidth;
  }

  get #scrollPosition() {
    return this.#slidesContainer.scrollLeft;
  }

  #scrollTo(newIdx) {
    this.#slidesContainer.scrollTo(this.#slideWidth * newIdx, 0);
    this.#updateState(); // scrollTo does not trigger "scroll" event listener, need to call update specifically
  }

  #updateState() {
    const newIdx = Math.round(this.#scrollPosition / this.#slideWidth);
    if (this.#current === newIdx) return;

    // update the dots
    if (this.#current !== undefined)
      this.#dots[this.#current].classList.remove("active");
    this.#dots[newIdx].classList.add("active");

    this.#current = newIdx;
  }
}
