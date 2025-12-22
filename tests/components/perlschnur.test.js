/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect } from "vitest";

import { Perlschnur } from "script/components/perlschnur.js";
import { prepareDataForPerlschnur } from "script/data/components/perlschnur.js";
import { Itinerary } from "script/types/itinerary.js";

import {
  getTestColor as _color,
  connectionFromShorthand as _c,
} from "tests/_helpers/data.js";
import { initTestDOM, TEST_DOM, timeout } from "tests/_helpers/domUtils.js";

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

// need this multiple times to grab stop data from DOM
function _stop(date, time, station) {
  return {
    selectors: {
      ".time": { innerText: time },
      ".date": { innerText: date },
      ".station": { innerText: station },
    },
  };
}

test("update view should fill in template correctly", async function () {
  const c1 = _c("T1: S1@D1T10->S2@D1T11->S3@D1T12");
  const c2 = _c("T2: S3@D1T13->S4@D1T14");
  const c3 = _c("T3: S4@D1T17->S5@D2T07"); // overnight

  const perlschnur = new Perlschnur(TEST_DOM.summary);
  await updatePerlschnur(perlschnur, [c1, c2, c3]);

  // overview
  expect(TEST_DOM.summary).toMatchDOMObject({
    selectors: {
      ".from": { innerText: "Stop1" },
      ".to": { innerText: "Stop5" },
      ".via": { innerText: "via Stop3, Stop4" },
      ".total-time": { innerText: "20h 59min" },
    },
  });

  // connections
  const gotConnections = TEST_DOM.perlschnurConnections;
  expect(gotConnections.length).toBe(3);

  // connection 1
  expect(gotConnections[0]).toMatchDOMObject({
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerText: "ICE T1" },
      ".connection-travel-time": { innerText: "1h 59min" },
    },
    style: { "--color": _color(0) },
  });

  // stops for connection 1
  let gotStops = gotConnections[0].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(3);
  expect(gotStops[0]).toMatchDOMObject(_stop("", "10:01", "Stop1"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "11:00", "Stop2"));
  expect(gotStops[2]).toMatchDOMObject(_stop("", "12:00", "Stop3"));

  // connection 2
  expect(gotConnections[1]).toMatchDOMObject({
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerText: "ICE T2" },
      ".connection-travel-time": { innerText: "59min" },
    },
    style: { "--color": _color(1) },
  });

  // stops for connection 2
  gotStops = gotConnections[1].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(2);
  expect(gotStops[0]).toMatchDOMObject(_stop("", "13:01", "Stop3"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "14:00", "Stop4"));

  // connection 3
  expect(gotConnections[2]).toMatchDOMObject({
    selectors: {
      ".connection-icon": { src: expect.stringMatching("train.svg") },
      ".connection-number": { innerText: "ICE T3" },
      ".connection-travel-time": { innerText: "13h 59min" },
    },
    style: { "--color": _color(2) },
  });

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

  // overview
  expect(TEST_DOM.summary).toMatchDOMObject({
    selectors: {
      ".from": { innerText: "Stop3" },
      ".to": { innerText: "Stop4" },
      ".via": { innerText: "" },
      ".total-time": { innerText: "59min" },
    },
  });

  // connections
  const gotConnections = TEST_DOM.perlschnurConnections;
  expect(gotConnections.length).toBe(1);
  expect(gotConnections[0]).toMatchDOMObject({
    selectors: {
      ".connection-number": { innerText: "ICE T2" },
    },
    style: { "--color": _color(0) },
  });

  // stops
  let gotStops = gotConnections[0].querySelectorAll(".perlschnur-stop");
  expect(gotStops.length).toBe(2);
  expect(gotStops[0]).toMatchDOMObject(_stop("", "13:01", "Stop3"));
  expect(gotStops[1]).toMatchDOMObject(_stop("", "14:00", "Stop4"));

  // transfers
  const gotTransfers = TEST_DOM.perlschnurTransfers;
  expect(gotTransfers.length).toBe(0);
});
