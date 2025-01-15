/**
 * @jest-environment jsdom
 */

const {
  TravelCalendar,
} = require("../../script/components/calendar2/travelCalendar.js");

const {
  TravelOption,
} = require("../../script/components/calendar2/travelOption.js");

// to get drag events
require("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

const ROW_OFFSET = 2; // 1 for header, 1 because indexes start at 1
const COLUMN_OFFSET = 2; // 1 for hour column, 1 because indexes start at 1

const FIRST_DATE = "2024-10-15";
const SECOND_DATE = "2024-10-16";
const THIRD_DATE = "2024-10-17";

const t1 = (timeStr) => `${FIRST_DATE}T${timeStr}`;
const t2 = (timeStr) => `${SECOND_DATE}T${timeStr}`;
const t3 = (timeStr) => `${THIRD_DATE}T${timeStr}`;

beforeEach(() => {
  document.body.innerHTML = `<travel-calendar id='calendar' start-date='${FIRST_DATE}'></travel-calendar>`;
});

function dispatchEvent(element, eventName, timeout_ms = 10) {
  const classes = {
    mouseover: MouseEvent,
    mouseout: MouseEvent,
    dragstart: DragEvent,
    dragend: DragEvent,
    dragenter: DragEvent,
    dragleave: DragEvent,
  };

  const clazz = classes[eventName];
  element.dispatchEvent(new clazz(eventName, { bubbles: true }));

  // wait for changes after dispatching to hove finished (hopefully waiting long enough)...
  return new Promise((resolve) => setTimeout(resolve, timeout_ms));
}

function getShadowDOMItems(calendar, querySelector) {
  const elements = [];
  for (let el of calendar.shadowRoot.querySelectorAll(querySelector)) {
    elements.push({
      element: el,
      innerHTML: el.innerHTML,
      dataset: el.dataset,
      gridColumn: el.style._values["grid-column"],
      gridRowStart: el.style._values["grid-row-start"],
      gridRowEnd: el.style._values["grid-row-end"],
    });
  }
  return elements;
}

function createEntry(startDateTime, endDateTime, selected = false) {
  const entry = document.createElement("travel-option");
  entry.startTime = startDateTime;
  entry.endTime = endDateTime;
  entry.startCity = "My start city";
  entry.endCity = "My end city";
  entry.dataset.group = "start-end";
  if (selected) entry.setAttribute("status", "selected");
  return entry;
}

test("dateLabelsAtInitialization", function () {
  const calendar = document.querySelector("#calendar");
  const got = getShadowDOMItems(calendar, ".date-label");

  expect(got.length).toBe(3);

  expect(got[0].innerHTML).toContain("15");
  expect(got[0].gridColumn).toBe(2);
  expect(got[0].gridRowStart).toBe(1);
  expect(got[0].gridRowEnd).toBe(2);

  expect(got[1].innerHTML).toContain("16");
  expect(got[1].gridColumn).toBe(3);
  expect(got[1].gridRowStart).toBe(1);
  expect(got[1].gridRowEnd).toBe(2);

  expect(got[2].innerHTML).toContain("17");
  expect(got[2].gridColumn).toBe(4);
  expect(got[2].gridRowStart).toBe(1);
  expect(got[2].gridRowEnd).toBe(2);
});

test("dateLabelsAfterDateChanged", async function () {
  const calendar = document.querySelector("#calendar");
  await calendar.setAttribute("start-date", "2023-03-20");

  const got = getShadowDOMItems(calendar, ".date-label");

  expect(got.length).toBe(3);

  expect(got[0].innerHTML).toContain("20");
  expect(got[0].gridColumn).toBe(2);
  expect(got[0].gridRowStart).toBe(1);
  expect(got[0].gridRowEnd).toBe(2);

  expect(got[1].innerHTML).toContain("21");
  expect(got[1].gridColumn).toBe(3);
  expect(got[1].gridRowStart).toBe(1);
  expect(got[1].gridRowEnd).toBe(2);

  expect(got[2].innerHTML).toContain("22");
  expect(got[2].gridColumn).toBe(4);
  expect(got[2].gridRowStart).toBe(1);
  expect(got[2].gridRowEnd).toBe(2);
});

test("entryFirstDate", async function () {
  const entry = createEntry(t1("14:00"), t1("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(1);
  expect(got[0].gridColumn).toBe(COLUMN_OFFSET);
  expect(got[0].gridRowStart).toBe(14 * 4 + ROW_OFFSET);
  expect(got[0].gridRowEnd).toBe(15 * 4 + ROW_OFFSET);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("My end city");
  expect(got[0].dataset.status).toBe("inactive");
  expect(got[0].dataset.dragStatus).toBe(undefined);
});

test("entrySecondDateWithCalendarDateChange", async function () {
  const entry = createEntry(t2("14:00"), t2("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  await calendar.setAttribute("start-date", SECOND_DATE);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(1);
  expect(got[0].gridColumn).toBe(COLUMN_OFFSET);
  expect(got[0].gridRowStart).toBe(14 * 4 + ROW_OFFSET);
  expect(got[0].gridRowEnd).toBe(15 * 4 + ROW_OFFSET);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("My end city");
});

test("entryFromMidnight", async function () {
  const entry = createEntry(t1("00:00"), t1("00:15"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(1);
  expect(got[0].gridColumn).toBe(2);
  expect(got[0].gridRowStart).toBe(2);
  expect(got[0].gridRowEnd).toBe(3);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("My end city");
});

test("entryEndsJustBeforeMidnight", async function () {
  const entry = createEntry(t3("14:30"), t3("23:59"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(1);
  expect(got[0].gridColumn).toBe(2 + COLUMN_OFFSET);
  expect(got[0].gridRowStart).toBe(14 * 4 + 2 + ROW_OFFSET);
  expect(got[0].gridRowEnd).toBe(24 * 4 + ROW_OFFSET);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("14:30");
  expect(got[0].innerHTML).toContain("My end city");
  expect(got[0].innerHTML).toContain("23:59");
});

test("entryTwoDays", async function () {
  const entry = createEntry(t1("16:29"), t2("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(2);

  expect(got[0].gridColumn).toBe(COLUMN_OFFSET);
  expect(got[0].gridRowStart).toBe(16 * 4 + 2 + ROW_OFFSET);
  expect(got[0].gridRowEnd).toBe(24 * 4 + ROW_OFFSET);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("16:29");
  expect(got[0].innerHTML).not.toContain("My end city");
  expect(got[0].innerHTML).not.toContain("18:04");

  expect(got[1].gridColumn).toBe(1 + COLUMN_OFFSET);
  expect(got[1].gridRowStart).toBe(ROW_OFFSET);
  expect(got[1].gridRowEnd).toBe(18 * 4 + ROW_OFFSET);
  expect(got[1].innerHTML).not.toContain("My start city");
  expect(got[1].innerHTML).not.toContain("16:29");
  expect(got[1].innerHTML).toContain("My end city");
  expect(got[1].innerHTML).toContain("18:04");
});

test("entryThreeDays", async function () {
  const entry = createEntry(t1("16:29"), t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.length).toBe(3);

  expect(got[0].gridColumn).toBe(COLUMN_OFFSET);
  expect(got[0].gridRowStart).toBe(16 * 4 + 2 + ROW_OFFSET);
  expect(got[0].gridRowEnd).toBe(24 * 4 + ROW_OFFSET);
  expect(got[0].innerHTML).toContain("My start city");
  expect(got[0].innerHTML).toContain("16:29");
  expect(got[0].innerHTML).not.toContain("My end city");
  expect(got[0].innerHTML).not.toContain("18:04");

  expect(got[1].gridColumn).toBe(1 + COLUMN_OFFSET);
  expect(got[1].gridRowStart).toBe(ROW_OFFSET);
  expect(got[1].gridRowEnd).toBe(24 * 4 + ROW_OFFSET);
  expect(got[1].innerHTML).not.toContain("My start city");
  expect(got[1].innerHTML).not.toContain("16:29");
  expect(got[1].innerHTML).not.toContain("My end city");
  expect(got[1].innerHTML).not.toContain("18:04");

  expect(got[2].gridColumn).toBe(2 + COLUMN_OFFSET);
  expect(got[2].gridRowStart).toBe(ROW_OFFSET);
  expect(got[2].gridRowEnd).toBe(18 * 4 + ROW_OFFSET);
  expect(got[2].innerHTML).not.toContain("My start city");
  expect(got[2].innerHTML).not.toContain("16:29");
  expect(got[2].innerHTML).toContain("My end city");
  expect(got[2].innerHTML).toContain("18:04");
});

test("entryThreeDaysHover", async function () {
  const entry = createEntry(t1("16:29"), t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const parts = getShadowDOMItems(calendar, ".entry-part");

  // by default no part should hover
  for (let part of parts) expect(part.element.classList).not.toContain("hover");

  // simulate mouseover
  // now all parts should hover
  await dispatchEvent(parts[1].element, "mouseover");
  for (let part of parts) expect(part.element.classList).toContain("hover");

  // simulate mouseout over different part
  // now again no part should hover
  await dispatchEvent(parts[2].element, "mouseout");
  for (let part of parts) expect(part.element.classList).not.toContain("hover");
});

// todo group, todo droping over wrong group
test("dragNDropMultidayNoDrop", async function () {
  const entry1 = createEntry(t1("16:29"), t2("18:04"), true);
  const entry2 = createEntry(t2("16:29"), t3("18:04"), false);

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry1);
  await calendar.appendChild(entry2);

  const parts = getShadowDOMItems(calendar, ".entry-part");

  await dispatchEvent(parts[1].element, "dragstart");

  /*const state = parts.map((p) => p.dataset.status);
  expect(state).toStrictEqual(["inactive", "inactive", "inactive", "inactive"]);
  const drag = parts.map((p) => p.dataset.dragStatus);
  expect(drag).toStrictEqual(["indicator", undefined, "indicator", undefined]);

  await dispatchEvent(parts[3].element, "dragenter");*/
});
