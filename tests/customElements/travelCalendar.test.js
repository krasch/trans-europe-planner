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

const ROW_MIDNIGHT = 2; // 1 for header, 1 because indexes start at 1
const COLUMN_FIRST_DAY = 2; // 1 for hour column, 1 because indexes start at 1

const FIRST_DATE = "2024-10-15";
const SECOND_DATE = "2024-10-16";
const THIRD_DATE = "2024-10-17";

const t1 = (timeStr) => `${FIRST_DATE}T${timeStr}`;
const t2 = (timeStr) => `${SECOND_DATE}T${timeStr}`;
const t3 = (timeStr) => `${THIRD_DATE}T${timeStr}`;

beforeEach(() => {
  document.body.innerHTML = `<travel-calendar id='calendar' start-date='${FIRST_DATE}'></travel-calendar>`;
});

function dispatchEvent(element, eventName, group = null, timeout_ms = 10) {
  const classes = {
    mouseover: MouseEvent,
    mouseout: MouseEvent,
    dragstart: DragEvent,
    dragend: DragEvent,
    dragenter: DragEvent,
    dragleave: DragEvent,
    drop: DragEvent,
  };

  const clazz = classes[eventName];
  const event = new clazz(eventName, { bubbles: true });
  if (group) event.dataTransfer.setData(group, group);

  element.dispatchEvent(event);

  // wait for changes after dispatching to hove finished (hopefully waiting long enough)...
  return new Promise((resolve) => setTimeout(resolve, timeout_ms));
}

function getShadowDOMItems(calendar, querySelector) {
  const elements = Array.from(
    calendar.shadowRoot.querySelectorAll(querySelector),
  );

  return {
    elements: elements,
    // returning these as getters so that it always takes the newest data directly from the
    // HTML element instead of having to fetch elements every time
    all: {
      get gridColumn() {
        return elements.map((e) => e.style._values["grid-column"]);
      },
      get gridRows() {
        return elements.map((e) => [
          e.style._values["grid-row-start"],
          e.style._values["grid-row-end"],
        ]);
      },
      get dragStatus() {
        return elements.map((e) => e.dataset.dragStatus);
      },
      get isHover() {
        return elements.map((e) => e.classList.contains("hover"));
      },
      get isActive() {
        return elements.map((e) => e.dataset.status === "active");
      },
      get innerHTML() {
        return elements.map((e) => e.innerHTML);
      },
    },
  };
}

function createEntry(startDateTime, endDateTime, kwargs = {}) {
  const element = document.createElement("dive");
  element.classList.add("calendar-entry");

  element.dataset.departureDatetime = startDateTime;
  element.dataset.arrivalDatetime = endDateTime;
  element.dataset.active = kwargs.group ?? "default-group";
  element.dataset.group = kwargs.selected ? "active" : "inactive";

  element.innerHTML = `
        <div class="header">From somewhere</div>
        <div class="start">Start time and city</div>
        <div class="destination">End time and city</div>
  `;

  return element;
}

test("dateLabelsAtInitialization", function () {
  const calendar = document.querySelector("#calendar");
  const got = getShadowDOMItems(calendar, ".date-label");

  expect(got.all.gridColumn).toStrictEqual([2, 3, 4]);
  expect(got.all.gridRows).toStrictEqual([
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  expect(got.all.innerHTML[0]).toContain("15");
  expect(got.all.innerHTML[1]).toContain("16");
  expect(got.all.innerHTML[2]).toContain("17");
});

test("dateLabelsAfterDateChanged", async function () {
  const calendar = document.querySelector("#calendar");
  await calendar.setAttribute("start-date", "2023-03-20");

  const got = getShadowDOMItems(calendar, ".date-label");

  expect(got.all.gridColumn).toStrictEqual([2, 3, 4]);
  expect(got.all.gridRows).toStrictEqual([
    [1, 2],
    [1, 2],
    [1, 2],
  ]);

  expect(got.all.innerHTML[0]).toContain("20");
  expect(got.all.innerHTML[1]).toContain("21");
  expect(got.all.innerHTML[2]).toContain("22");
});

test("entryFirstDate", async function () {
  const entry = createEntry(t1("14:00"), t1("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 14 * 4, ROW_MIDNIGHT + 15 * 4],
  ]);

  expect(got.all.innerHTML[0]).toContain("My start city");
  expect(got.all.innerHTML[0]).toContain("My end city");
});

test("entrySecondDateWithCalendarDateChange", async function () {
  const entry = createEntry(t2("14:00"), t2("15:00"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  await calendar.setAttribute("start-date", SECOND_DATE);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 14 * 4, ROW_MIDNIGHT + 15 * 4],
  ]);
});

test("entryFromMidnight", async function () {
  const entry = createEntry(t1("00:00"), t1("00:15"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([COLUMN_FIRST_DAY]);
  expect(got.all.gridRows).toStrictEqual([[ROW_MIDNIGHT, 1 + ROW_MIDNIGHT]]);
});

test("entryEndsJustBeforeMidnight", async function () {
  const entry = createEntry(t3("14:30"), t3("23:59"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([COLUMN_FIRST_DAY + 2]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 14.5 * 4, ROW_MIDNIGHT + 24 * 4],
  ]);

  expect(got.all.innerHTML[0]).toContain("My start city");
  expect(got.all.innerHTML[0]).toContain("14:30");
  expect(got.all.innerHTML[0]).toContain("My end city");
  expect(got.all.innerHTML[0]).toContain("23:59");
});

test("entryTwoDays", async function () {
  const entry = createEntry(t1("16:29"), t2("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([
    COLUMN_FIRST_DAY,
    COLUMN_FIRST_DAY + 1,
  ]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 16.5 * 4, ROW_MIDNIGHT + 24 * 4],
    [ROW_MIDNIGHT, ROW_MIDNIGHT + 18 * 4],
  ]);

  expect(got.all.innerHTML[0]).toContain("My start city");
  expect(got.all.innerHTML[0]).toContain("16:29");
  expect(got.all.innerHTML[0]).not.toContain("My end city");
  expect(got.all.innerHTML[0]).not.toContain("18:04");

  expect(got.all.innerHTML[1]).not.toContain("My start city");
  expect(got.all.innerHTML[1]).not.toContain("16:29");
  expect(got.all.innerHTML[1]).toContain("My end city");
  expect(got.all.innerHTML[1]).toContain("18:04");
});

test("entryThreeDays", async function () {
  const entry = createEntry(t1("16:29"), t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const got = getShadowDOMItems(calendar, ".entry-part");

  expect(got.all.gridColumn).toStrictEqual([
    COLUMN_FIRST_DAY,
    COLUMN_FIRST_DAY + 1,
    COLUMN_FIRST_DAY + 2,
  ]);
  expect(got.all.gridRows).toStrictEqual([
    [ROW_MIDNIGHT + 16.5 * 4, ROW_MIDNIGHT + 24 * 4],
    [ROW_MIDNIGHT, ROW_MIDNIGHT + 24 * 4],
    [ROW_MIDNIGHT, ROW_MIDNIGHT + 18 * 4],
  ]);

  expect(got.all.innerHTML[0]).toContain("My start city");
  expect(got.all.innerHTML[0]).toContain("16:29");
  expect(got.all.innerHTML[0]).not.toContain("My end city");
  expect(got.all.innerHTML[0]).not.toContain("18:04");

  expect(got.all.innerHTML[1]).not.toContain("My start city");
  expect(got.all.innerHTML[1]).not.toContain("16:29");
  expect(got.all.innerHTML[1]).not.toContain("My end city");
  expect(got.all.innerHTML[1]).not.toContain("18:04");

  expect(got.all.innerHTML[2]).not.toContain("My start city");
  expect(got.all.innerHTML[2]).not.toContain("16:29");
  expect(got.all.innerHTML[2]).toContain("My end city");
  expect(got.all.innerHTML[2]).toContain("18:04");
});

test("entryThreeDaysHover", async function () {
  const entry = createEntry(t1("16:29"), t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  // by default no part should hover
  let got = getShadowDOMItems(calendar, ".entry-part");
  expect(got.all.isHover).toStrictEqual([false, false, false]);

  // after mouseover all parts should hover
  await dispatchEvent(got.elements[0], "mouseover");
  expect(got.all.isHover).toStrictEqual([true, true, true]);

  // after mouseout no parts should hover
  await dispatchEvent(got.elements[2], "mouseout");
  expect(got.all.isHover).toStrictEqual([false, false, false]);
});

// todo group, todo droping over wrong group
test("dragNDropMultidayNoDrop", async function () {
  const group = "Berlin->München";
  const other = "München->Verona";

  const entries = [
    // first two entries are from the same group and can be dragged/dropped
    createEntry(t1("16:29"), t2("18:04"), { group: group, selected: true }),
    createEntry(t2("16:29"), t3("18:04"), { group: group, selected: false }),
    // third entry is from a different group and should not interact with first group
    createEntry(t1("04:30"), t1("05:11"), { group: other, selected: true }),
  ];

  const calendar = document.querySelector("#calendar");
  for (let e of entries) await calendar.appendChild(e);

  const got = getShadowDOMItems(calendar, ".entry-part");
  const elements = {
    e1: { part1: got.elements[0], part2: got.elements[1] },
    e2: { part1: got.elements[2], part2: got.elements[3] },
    e3: { part1: got.elements[4] },
  };

  const exp = {
    status: {
      e1_and_e3_active: [true, true, false, false, true],
      e2_and_e3_active: [false, false, true, true, true],
      only_e3_active: [false, false, false, false, true],
    },
    drag: {
      all_undefined: [undefined, undefined, undefined, undefined, undefined],
      e1_and_e2_indicator: [
        "indicator",
        undefined,
        "indicator",
        undefined,
        undefined,
      ],
      e1indicator_e2preview: [
        "indicator",
        undefined,
        "preview",
        "preview",
        undefined,
      ],
      e1preview_e2indicator: [
        "preview",
        "preview",
        "indicator",
        undefined,
        undefined,
      ],
    },
  };

  // initial values
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  /// when starting dragging e1, it should turn inactive and e1 and e2 should show indicators
  await dispatchEvent(elements.e1.part1, "dragstart");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when dragentering e2, it should become preview
  await dispatchEvent(elements.e2.part2, "dragenter", group);
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1indicator_e2preview);

  // after dragleaving e2, it should switch back to indicator
  await dispatchEvent(elements.e2.part1, "dragleave", group);
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when dragentering e3, nothing should happen
  await dispatchEvent(elements.e3.part1, "dragenter", group);
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when dragleaving e3, nothing should happen either
  await dispatchEvent(elements.e3.part1, "dragleave", group);
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when drop is canceled, it should snap back to e1 being active
  // need to dispatch the dragend over e1, in reality this is not necessary
  await dispatchEvent(elements.e1.part1, "dragend", group);
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  // dragging e1 to e2 -> e2 should become active
  await dispatchEvent(elements.e1.part1, "dragstart");
  await dispatchEvent(elements.e2.part2, "drop", group);
  expect(got.all.isActive).toStrictEqual(exp.status.e2_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  // dragging e2 to e2 -> e1 should become active
  await dispatchEvent(elements.e2.part2, "dragstart");
  await dispatchEvent(elements.e1.part1, "dragenter", group);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1preview_e2indicator);
  await dispatchEvent(elements.e1.part2, "drop", group);
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);
});
