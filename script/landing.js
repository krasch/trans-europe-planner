// todo read this article to add accessibility:
// https://medium.com/web-dev-survey-from-kyoto/vanilla-js-carousel-that-is-accessible-swipeable-infinite-scrolling-and-autoplaying-5de5f281ef13

class Carousel {
  #slidesContainer;
  #controlContainer;

  #slides;
  #dots;
  #arrows;

  #numSlides;
  #current;

  constructor(container, initialPosition = 1) {
    this.#slidesContainer = container.querySelector("#slides");
    this.#slides = this.#slidesContainer.querySelectorAll(".slide");
    this.#numSlides = this.#slides.length;

    this.#controlContainer = container.querySelector("#slide-controls");
    this.#dots = this.#controlContainer.querySelectorAll(".dot");
    this.#arrows = this.#controlContainer.querySelectorAll(".arrow");

    // hop quickly to initial position
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
    if (newIdx < 0) newIdx = this.#numSlides - 1;
    else if (newIdx > this.#numSlides - 1) newIdx = 0;

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

export async function showLandingPage(modal) {
  const select = modal.querySelector("form select");
  const carousel = modal.querySelector("#slide-carousel");

  const homeSelectedPromise = new Promise((resolve) =>
    modal.addEventListener("close", (e) => {
      resolve(select.value);
    }),
  );

  // modal will be automagically closed when user clicks the submit button
  modal.show();

  // init carousel interactivity
  // must happen after modal.show, otherwise slide.width is not yet defined and the calculations fail
  // todo perhaps wait for a load event or something like that in carousel constructor?
  new Carousel(carousel);

  return homeSelectedPromise;
}
