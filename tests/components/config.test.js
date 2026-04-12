/**
 * @vitest-environment jsdom
 */
// @ts-nocheck
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Config } from "app/components/config.js";
import { geocode, getStopInfo } from "app/data/motis/client.js";
import { DateTime } from "app/types/dateTime.js";
import { Stop } from "app/types/stop.js";

import { DAY1 } from "tests/_helpers/data.js";
import { dispatchTestEvent, initTestDOM } from "tests/_helpers/domUtils.js";

vi.mock("app/data/motis/client.js", () => {
  return { geocode: vi.fn(), getStopInfo: vi.fn() };
});

beforeEach(async () => {
  initTestDOM();
  // wire up event handlers
  new Config(document.querySelector("#config"));
});

afterEach(async () => {
  vi.restoreAllMocks();
});

test.each(["from", "to"])(
  "There should no autocomplete options if user typed in < 3 chars",
  async (formSection) => {
    const input = document.querySelector(`#config-${formSection}`);
    const options = document.querySelector(`#config-${formSection}-values`);

    input.value = "ab";
    await dispatchTestEvent(input, "input");

    expect(options.innerHTML).toBe("");
  },
);

test.each(["from", "to"])(
  "Autocomplete should call geocoding and fill in options",
  async (formSection) => {
    const input = document.querySelector(`#config-${formSection}`);
    const options = document.querySelector(`#config-${formSection}-values`);

    // @ts-ignore
    geocode.mockImplementation(() => [
      new Stop("id1", "abcd1", 10, 10),
      new Stop("id2", "abcd2", 20, 20),
      new Stop("id3", "abcd3", 30, 30),
    ]);

    input.value = "abcd";
    await dispatchTestEvent(input, "input");

    expect(options.children).toMatchDOMObjectList([
      { innerHTML: expect.stringContaining("abcd1"), dataset: { id: "id1" } },
      { innerHTML: expect.stringContaining("abcd2"), dataset: { id: "id2" } },
      { innerHTML: expect.stringContaining("abcd3"), dataset: { id: "id3" } },
    ]);
  },
);

test.each(["from", "to"])(
  "Picking an autocomplete item should set the input value",
  async (formSection) => {
    const container = document.querySelector("#config");

    const input = container.querySelector(`#config-${formSection}`);
    const options = container.querySelector(`#config-${formSection}-values`);

    const stop = new Stop("id1", "abcd1", 10, 10);
    geocode.mockImplementation(() => [stop]);
    getStopInfo.mockImplementation(() => stop);

    // filled in text
    input.value = "abcd1"; // must be at least 3 chars
    await dispatchTestEvent(input, "input");

    // clicked on autocomplete option
    await dispatchTestEvent(options.children[0], "click");

    expect(input.value).toBe("abcd1");
    expect(input.dataset.id).toBe("id1");
  },
);

test("Clicking submit should execute the callback", async () => {
  const container = document.querySelector("#config");
  const config = new Config(container, DAY1, DAY1.plus({ days: 3 }));

  const callback = vi.fn();
  config.on("submit", callback);

  container.querySelector(`#config-from`).dataset.id = "S1";
  container.querySelector(`#config-to`).dataset.id = "S2";
  container.querySelector(`#config-date`).value = "2025-01-01";

  dispatchTestEvent(container, "submit");
  expect(callback).toHaveBeenCalledWith(
    "S1",
    "S2",
    DateTime.fromISO("2025-01-01"),
  );
});
