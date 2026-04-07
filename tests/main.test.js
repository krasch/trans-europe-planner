/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { main } from "app/main.js";
import { ConnectionId } from "app/types/connection.js";
import { getURLState, setURLState } from "app/url.js";

import { DAY1 } from "tests/_helpers/data.js";

vi.mock("app/render.js", () => {
  return { render: vi.fn() };
});

vi.mock("app/url.js", () => {
  return {
    URLObserver: vi.fn(
      class {
        on = vi.fn;
      },
    ),
    getURLState: vi.fn(),
    setURLState: vi.fn(),
  };
});

afterEach(async () => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
});

function mockComponents() {
  const callbacks = {
    config: {},
    map: {},
    calendar: {},
    perlschnur: {},
  };

  const components = {
    config: {
      updateView: vi.fn(),
      lock: vi.fn(),
      unlock: vi.fn(),
      on: (name, fn) => (callbacks.config[name] = fn),
    },
    map: {
      updateView: vi.fn(),
      on: (name, fn) => (callbacks.map[name] = fn),
    },
    calendar: {
      updateView: vi.fn(),
      on: (name, fn) => (callbacks.calendar[name] = fn),
    },
    perlschnur: {
      updateView: vi.fn(),
      on: (name, fn) => (callbacks.perlschnur[name] = fn),
    },
  };

  return [components, callbacks];
}

test("Moving a calendar event should update the URL", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const c1 = new ConnectionId("T1", "S1", "S2", DAY1);
  const c2 = new ConnectionId("T2", "S2", "S3", DAY1);
  const c2_new = new ConnectionId("T2b", "S2", "S3", DAY1);
  const c3 = new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 }));

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: [c1, c2, c3],
    alternatives: [],
  }));

  callbacks.calendar.connectionMoved(c2_new.toString());
  expect(setURLState).toHaveBeenCalledWith(
    "S1",
    "S4",
    DAY1,
    [c1, c2_new, c3],
    [],
  );
});

test("Moving a calendar event for a non-existing leg should do nothing", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const c1 = new ConnectionId("T1", "S1", "S2", DAY1);
  const c2_new = new ConnectionId("T2b", "S2", "S3", DAY1);
  const c3 = new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 }));

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: [c1, c3],
    alternatives: [],
  }));

  callbacks.calendar.connectionMoved(c2_new.toString());
  expect(setURLState).not.toHaveBeenCalled();
});

test("Moving a calendar event to the same position should do nothing", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const c1 = new ConnectionId("T1", "S1", "S2", DAY1);
  const c2 = new ConnectionId("T2", "S2", "S3", DAY1);
  const c3 = new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 }));

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: [c1, c2, c3],
    alternatives: [],
  }));

  callbacks.calendar.connectionMoved(c2.toString());
  expect(setURLState).not.toHaveBeenCalled();
});

test("Clicking on the currently active route on the map should do nothing", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const active = [
    new ConnectionId("T1", "S1", "S2", DAY1),
    new ConnectionId("T2", "S2", "S3", DAY1),
  ];
  const alternative1 = [new ConnectionId("T3", "S1", "S3", DAY1)];
  const alternative2 = [
    new ConnectionId("T4", "S1", "S4", DAY1),
    new ConnectionId("T5", "S4", "S2", DAY1),
    new ConnectionId("T6", "S2", "S3", DAY1.plus({ days: 1 })),
  ];

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: active,
    alternatives: [alternative1, alternative2],
  }));

  callbacks.map.itineraryClicked("S1->S2->S3");
  expect(setURLState).not.toHaveBeenCalled();
});

test("Clicking on a different route on the map should update the URL", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const active = [
    new ConnectionId("T1", "S1", "S2", DAY1),
    new ConnectionId("T2", "S2", "S3", DAY1),
  ];
  const alternative1 = [new ConnectionId("T3", "S1", "S3", DAY1)];
  const alternative2 = [
    new ConnectionId("T4", "S1", "S4", DAY1),
    new ConnectionId("T5", "S4", "S2", DAY1),
    new ConnectionId("T6", "S2", "S3", DAY1.plus({ days: 1 })),
  ];

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: active,
    alternatives: [alternative1, alternative2],
  }));

  callbacks.map.itineraryClicked("S1->S4->S2->S3");
  expect(setURLState).toHaveBeenCalledWith("S1", "S4", DAY1, alternative2, [
    alternative1,
    active,
  ]);
});

test("Clicking on a non-existing route on the map should do nothing", async () => {
  const [components, callbacks] = mockComponents();
  await main(components);

  const active = [
    new ConnectionId("T1", "S1", "S2", DAY1),
    new ConnectionId("T2", "S2", "S3", DAY1),
  ];

  // @ts-ignore
  getURLState.mockImplementation(() => ({
    from: "S1",
    to: "S4",
    date: DAY1,
    active: active,
    alternatives: [],
  }));

  callbacks.map.itineraryClicked("S1->S4->S100->S3");
  expect(setURLState).not.toHaveBeenCalled();
});
