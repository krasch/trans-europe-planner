// todo read this article to add accessibility:
// https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13

export class Carousel {
  #slidesContainer;
  #controlContainer;

  #slides;
  #dots;
  #arrows;

  #current;

  constructor(container, initialPosition = 2) {
    this.#slidesContainer = container.querySelector("#slides");
    this.#slides = this.#slidesContainer.querySelectorAll("*");

    this.#controlContainer = container.querySelector("#pagination");
    this.#dots = this.#controlContainer.querySelectorAll(".dot");
    this.#arrows = this.#controlContainer.querySelectorAll(".arrow");

    // hop quickly to initial position todo smooth on
    this.#scrollTo(initialPosition);

    // when user uses the scrollbar (or swipes), we want to update the dots and arrows
    this.#slidesContainer.addEventListener("scroll", () => this.#updateState());

    // control bar buttons
    this.#controlContainer.addEventListener("click", (e) => {
      const closest = e.target.closest("img");
      if (!closest) return;

      // clicked on a dot
      if (closest.classList.contains("dot")) {
        const slide = Number(closest.dataset.slide);
        this.#scrollTo(slide - 1); // scroll-to uses 0-indexed array
      }

      // clicked on an arrow
      if (closest.classList.contains("arrow")) {
        if (closest.dataset.slide === "prev") this.#scrollTo(this.#current - 1);
        else this.#scrollTo(this.#current + 1);
      }
    });
  }

  get #slideWidth() {
    return this.#slides[0].offsetWidth;
  }

  get #scrollPosition() {
    return this.#slidesContainer.scrollLeft;
  }

  #scrollTo(newIdx) {
    // after right-most item comes left-most and vice-versa
    if (newIdx < 0) newIdx = 2;
    else if (newIdx > 2) newIdx = 0;

    this.#slidesContainer.scrollTo(this.#slideWidth * newIdx, 0);
    this.#updateState(); // scrollTo does not trigger "scroll" event listener, need to call update explicitly
  }

  #updateState() {
    const newIdx = Math.round(this.#scrollPosition / this.#slideWidth);
    if (this.#current === newIdx) return;

    // hide current dot
    if (this.#current !== undefined)
      this.#dots[this.#current].classList.remove("active");

    // show new dot
    this.#dots[newIdx].classList.add("active");

    this.#current = newIdx;
  }
}
