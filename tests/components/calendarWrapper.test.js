/**
 *
 * @vitest-environment jsdom
 */
// @ts-nocheck -- loads of ts warnings because of mocking
import { test, expect, vi, beforeEach } from "vitest";

import {
  CalendarWrapper,
  createEntryFromConnection,
} from "app/components/calendar.js";

import { DAY1 } from "tests/_helpers/data.js";
import { initTestDOM } from "tests/_helpers/domUtils.js";

beforeEach(() => {
  initTestDOM();
});

function mockTravelCalendar() {
  const mock = {
    getAttribute: () => DAY1,
    on: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
  };

  mock.appendChildCalledWithDepartureTimes = () =>
    mock.appendChild.mock.calls.map(
      (args) => args[0].dataset.departureDatetime,
    );

  mock.removeChildCalledWithDepartureTimes = () =>
    mock.removeChild.mock.calls.map(
      (args) => args[0].dataset.departureDatetime,
    );

  return mock;
}

test("create entry should fill the template correctly", async function () {
  const c = {
    id: "123",
    leg: `S1->S2`,
    name: "ICE 123",
    icon: "rail.svg",
    from: "Stop1",
    departure: DAY1.plus({ hours: 3, minutes: 10 }),
    to: "Stop2",
    arrival: DAY1.plus({ days: 1, hours: 22, minutes: 37 }),
    color: "red",
    status: "active",
  };

  const got = createEntryFromConnection(c);
  expect(got).toMatchDOMObject({
    dataset: {
      connectionId: "123",
      group: "S1->S2",
      status: "active",
      color: "red",
      departureDatetime: c.departure.toISO(),
      arrivalDatetime: c.arrival.toISO(),
    },
    selectors: {
      ".connection-icon": { src: "rail.svg" },
      ".connection-number": { innerHTML: "ICE 123" },
      ".start .time": { innerHTML: "03:10" },
      ".start .station": { innerHTML: "Stop1" },
      ".destination .time": { innerHTML: "22:37" },
      ".destination .station": { innerHTML: "Stop2" },
    },
  });
});

test("New connection should be added as entry to travelCalendar", async () => {
  const c = {
    id: "c1",
    departure: DAY1.plus({ minutes: 1 }),
    arrival: DAY1.plus({ minutes: 1 }),
  };

  const mock = mockTravelCalendar();
  const calendar = new CalendarWrapper(mock);

  calendar.updateView(DAY1, [c]);

  expect(mock.appendChild).toHaveBeenCalledTimes(1);
  expect(mock.removeChild).toHaveBeenCalledTimes(0);

  expect(mock.appendChildCalledWithDepartureTimes()).toStrictEqual([
    c.departure.toISO(),
  ]);
});

test("If multiple connections are added, they should be sorted by departure time", async () => {
  const c1 = {
    id: "c1",
    departure: DAY1.plus({ minutes: 100 }),
    arrival: DAY1.plus({ minutes: 100 }),
  };
  const c2 = {
    id: "c2",
    departure: DAY1.plus({ minutes: 1 }),
    arrival: DAY1.plus({ minutes: 1 }),
  };

  const mock = mockTravelCalendar();
  const calendar = new CalendarWrapper(mock);

  calendar.updateView(DAY1, [c1, c2]);

  expect(mock.appendChild).toHaveBeenCalledTimes(2);
  expect(mock.removeChild).toHaveBeenCalledTimes(0);

  expect(mock.appendChildCalledWithDepartureTimes()).toStrictEqual([
    c2.departure.toISO(),
    c1.departure.toISO(),
  ]);
});

test("If connection is removed, the respective entry should be removed from travelCalendar", async () => {
  const c = {
    id: "c1",
    departure: DAY1.plus({ minutes: 1 }),
    arrival: DAY1.plus({ minutes: 1 }),
  };

  const mock = mockTravelCalendar();
  const calendar = new CalendarWrapper(mock);

  calendar.updateView(DAY1, [c]);
  vi.resetAllMocks();

  calendar.updateView(DAY1, []);

  expect(mock.appendChild).toHaveBeenCalledTimes(0);
  expect(mock.removeChild).toHaveBeenCalledTimes(1);

  expect(mock.removeChildCalledWithDepartureTimes()).toStrictEqual([
    c.departure.toISO(),
  ]);
});

test("If connections stay the same, travelCalendar should not be called", async () => {
  const c = {
    id: "c1",
    departure: DAY1.plus({ minutes: 1 }),
    arrival: DAY1.plus({ minutes: 2 }),
  };

  const mock = mockTravelCalendar();
  const calendar = new CalendarWrapper(mock);

  calendar.updateView(DAY1, [c]);
  vi.resetAllMocks();

  calendar.updateView(DAY1, [c]);

  expect(mock.appendChild).toHaveBeenCalledTimes(0);
  expect(mock.removeChild).toHaveBeenCalledTimes(0);
});

test("If connection status changes, then status should also change in respective travelCalendarEntry", async () => {
  const c = {
    id: "c1",
    departure: DAY1.plus({ minutes: 1 }),
    arrival: DAY1.plus({ minutes: 2 }),
    status: "active-loading",
  };

  const cUpdated = structuredClone(c);
  cUpdated.status = "active";

  const mock = mockTravelCalendar();
  const calendar = new CalendarWrapper(mock);

  calendar.updateView(DAY1, [c]);
  const entry = mock.appendChild.mock.calls[0][0];

  calendar.updateView(DAY1, [cUpdated]);
  expect(entry.dataset.status).toBe("active");
});
