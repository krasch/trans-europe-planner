/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect, vi } from "vitest";

import { Perlschnur } from "script/components/perlschnur.js";
import {
  formatDate,
  prepareDataForPerlschnur,
} from "script/data/components/perlschnur.js";
import { Itinerary } from "script/types/itinerary.js";

import {
  connectionFromShorthand as _c,
  DAY1,
  TEST_COLORS,
} from "tests/_helpers/data.js";
import { initTestDOM, TEST_DOM, timeout } from "tests/_helpers/domUtils.js";

const DAY1_STRING = `(${formatDate(DAY1)})`;

vi.mock("script/data/components/_common.js", () => {
  return {
    getColor: (idx) => TEST_COLORS[idx],
    getIcon: (mode) => `${mode}.svg`,
  };
});

beforeEach(async () => {
  initTestDOM();
});

// these tests are mostly here to make sure that the data from the prepareDataForXXX methods
// is properly used to fill in the templates
// -> instead of directly creating the data, we are letting prepareDataForXXX prepare it
async function updatePerlschnur(perlschnur, connections) {
  const itinerary = new Itinerary(connections);
  const data = prepareDataForPerlschnur(itinerary);

  perlschnur.updateView(data);
  await timeout(10);
}

function _stop(date, time, station) {
  return {
    selectors: {
      ".time": { innerText: time },
      ".date": { innerText: date },
      ".station": { innerText: station },
    },
  };
}

function _connection(icon, number, travelTime, color) {
  return {
    selectors: {
      ".connection-icon": { src: expect.stringMatching(icon) },
      ".connection-number": { innerText: number },
      ".connection-travel-time": { innerText: travelTime },
    },
    style: { "--color": color },
  };
}

test("update view should fill in template correctly", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c2 = _c("T2: S3@D1T13->S4@D1T14");
  const c3 = _c("T3: S4@D1T17->S5@D2T07"); // overnight

  const perlschnur = new Perlschnur(TEST_DOM.summary);
  await updatePerlschnur(perlschnur, [c1, c2, c3]);

  // connections
  const gotConnections = TEST_DOM.perlschnurConnections;
  expect(gotConnections.length).toBe(3);

  // connection 1
  expect(gotConnections[0]).toMatchDOMObject(
    _connection("RAIL.svg", "ICE T1", "1h 59min", TEST_COLORS[0]),
  );

  // stops for connection 1
  let gotStops = gotConnections[0].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(3);
  expect(gotStops[0]).toMatchDOMObject(_stop(DAY1_STRING, "10:01", "Stop1"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "11:00", "Stop2"));
  expect(gotStops[2]).toMatchDOMObject(_stop("", "12:00", "Stop3"));

  // connection 2
  expect(gotConnections[1]).toMatchDOMObject(
    _connection("RAIL.svg", "ICE T2", "59min", TEST_COLORS[1]),
  );

  // stops for connection 2
  gotStops = gotConnections[1].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(2);
  expect(gotStops[0]).toMatchDOMObject(_stop("", "13:01", "Stop3"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "14:00", "Stop4"));

  // connection 3
  expect(gotConnections[2]).toMatchDOMObject(
    _connection("RAIL.svg", "ICE T3", "13h 59min", TEST_COLORS[2]),
  );

  // stops for connection 3
  gotStops = gotConnections[2].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(2);
  expect(gotStops[0]).toMatchDOMObject(_stop("", "17:01", "Stop4"));
  expect(gotStops[1]).toMatchDOMObject(_stop("(16 Oct)", "07:00", "Stop5"));

  // transfers
  const gotTransfers = TEST_DOM.perlschnurTransfers;
  expect(gotTransfers.length).toBe(2);

  // transfer between c1 and c2
  expect(gotTransfers[0]).toMatchDOMObject({
    selectors: { ".transfer-time": { innerText: "1h 1min" } },
  });

  // transfer between c2 and c3
  expect(gotTransfers[1]).toMatchDOMObject({
    selectors: { ".transfer-time": { innerText: "3h 1min" } },
  });
});

test("update view should update with new connection data", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c2 = _c("T2: S3@D1T13->S4@D1T14");
  const c3 = _c("T3: S4@D1T17->S5@D2T07"); // overnight

  // initial update
  const perlschnur = new Perlschnur(TEST_DOM.summary);
  await updatePerlschnur(perlschnur, [c1, c2, c3]);

  // new data
  await updatePerlschnur(perlschnur, [c2]);

  // connections
  const gotConnections = TEST_DOM.perlschnurConnections;
  expect(gotConnections.length).toBe(1);
  expect(gotConnections[0]).toMatchDOMObject(
    _connection("RAIL.svg", "ICE T2", "59min", TEST_COLORS[0]),
  );

  // stops
  let gotStops = gotConnections[0].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(2);
  expect(gotStops[0]).toMatchDOMObject(_stop(DAY1_STRING, "13:01", "Stop3"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "14:00", "Stop4"));

  // transfers
  const gotTransfers = TEST_DOM.perlschnurTransfers;
  expect(gotTransfers.length).toBe(0);
});
