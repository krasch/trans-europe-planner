/**
 * @vitest-environment jsdom
 */
import { expect, test } from "vitest";

import { updateElement } from "app/util.js";

import { timeout } from "tests/_helpers/domUtils.js";

test("Update root container", async () => {
  const element = document.createElement("div");
  updateElement(element, {
    ".": { innerHTML: "ladida", "data-key1": "value1" },
  });
  await timeout(10);

  expect(element.innerHTML).toBe("ladida");
  expect(element.dataset.key1).toBe("value1");
});

test("Update child element", async () => {
  const element = document.createElement("div");
  element.innerHTML =
    "<div>" +
    "  <span class='c1'></span>" +
    "  <span class='c1 c2'></span>" +
    "</div>";

  updateElement(element, {
    ".c1": { innerHTML: "ladida", "data-key1": "value1" },
    ".c2": { "data-key2": "value2" },
  });
  await timeout(10);

  expect(element.innerHTML).toBe(
    "<div>" +
      '  <span class="c1" data-key1="value1">ladida</span>' +
      '  <span class="c1 c2" data-key1="value1" data-key2="value2">ladida</span>' +
      "</div>",
  );
});
