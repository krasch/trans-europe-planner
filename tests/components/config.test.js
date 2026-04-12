/**
 * @vitest-environment jsdom
 */
// @ts-nocheck
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Config, setAutocompleteOptions } from "app/components/config.js";
import { geocode } from "app/data/motis/client.js";
import { DateTime } from "app/types/dateTime.js";
import { Stop } from "app/types/stop.js";

import { DAY1 } from "tests/_helpers/data.js";
import {
  dispatchTestEvent,
  initTestDOM,
  timeout,
} from "tests/_helpers/domUtils.js";

vi.mock("app/data/motis/client.js", () => {
  return { geocode: vi.fn() };
});

beforeEach(async () => {
  initTestDOM();
});

afterEach(async () => {
  vi.restoreAllMocks();
});

test("There should no autocomplete options if user typed in < 3 chars", async () => {
  const input = document.createElement("input");
  const container = document.createElement("ul");

  input.value = "ab";
  await setAutocompleteOptions(input, container);
  await timeout(10);

  expect(container.innerHTML).toBe("");
});

test("Autocomplete should call geocoding and fill in options", async () => {
  const input = document.createElement("input");
  const container = document.createElement("ul");

  // @ts-ignore
  geocode.mockImplementation(() => [
    new Stop("id1", "abcd1", 10, 10),
    new Stop("id2", "abcd2", 20, 20),
    new Stop("id3", "abcd3", 30, 30),
  ]);

  input.value = "abcd";
  await setAutocompleteOptions(input, container);
  await timeout(10);

  expect(container.children).toMatchDOMObjectList([
    { innerHTML: expect.stringContaining("abcd1"), dataset: { name: "abcd1" } },
    { innerHTML: expect.stringContaining("abcd2"), dataset: { name: "abcd2" } },
    { innerHTML: expect.stringContaining("abcd3"), dataset: { name: "abcd3" } },
  ]);
});

test.each(["from", "to"])(
  "Picking an autocomplete item should set the input value",
  async (formSection) => {
    const container = document.querySelector("#config");
    const config = new Config(container, DAY1, DAY1.plus({ days: 3 }));

    const input = container.querySelector(`#config-${formSection}`);
    const options = container.querySelector(`#config-${formSection}-values`);

    geocode.mockImplementation(() => [new Stop("id1", "abcd1", 10, 10)]);

    // filled in text
    input.value = "abcd"; // must be at least 3 chars
    await dispatchTestEvent(input, "input");

    // clicked on autocomplete option
    await dispatchTestEvent(options.children[0], "click");

    expect(input.value).toBe("abcd1");
  },
);

test("Clicking submit should execute the callback", async () => {
  const container = document.querySelector("#config");
  const config = new Config(container, DAY1, DAY1.plus({ days: 3 }));

  const callback = vi.fn();
  config.on("submit", callback);

  const from = new Stop("B", "Berlin", 10, 10);
  const to = new Stop("H", "Hamburg", 20, 20);

  container.querySelector(`#config-from`).dataset.data = JSON.stringify(from);
  container.querySelector(`#config-to`).dataset.data = JSON.stringify(to);
  container.querySelector(`#config-date`).value = "2025-01-01";

  dispatchTestEvent(container, "submit");
  expect(callback).toHaveBeenCalledWith(
    JSON.parse(JSON.stringify(from)),
    JSON.parse(JSON.stringify(to)),
    DateTime.fromISO("2025-01-01"),
  );
});
