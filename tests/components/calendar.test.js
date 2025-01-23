/**
 * @jest-environment jsdom
 */

const util = require("./calendarTestUtils");
const { CalendarWrapper } = require("../../script/components/calendar2.js");
const { timeout } = require("../calendarTestUtils.js");
const { DateTime } = require("luxon");

const template = `
    <div class="calendar-entry"
         data-departure-datetime=""
         data-arrival-datetime=""
         data-active=""
         data-group=""
         data-color="">

        <div class="header">
            <img class="connection-icon" alt="icon for train/ferry/etc" src=""/>
            <span class="connection-number"></span>
        </div>
        <div class="start">
            <span class="time"></span>
            <span class="station"></span>
        </div>
        <div class="destination">
            <span class="time"></span>
            <span class="station"></span>
        </div>
    </div>`;

beforeEach(() => {
  util.createDocument();

  const templateElement = document.createElement("template");
  templateElement.id = "template-calendar-connection";
  templateElement.innerHTML = template;

  document.body.appendChild(templateElement);
});

test("update view should fill in template correctly", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const data = {
    uniqueId: "1",
    leg: "Berlin->Oulu",
    name: "nachtzug 123",
    type: "train",
    startStation: "Berlin Gesundbrunnen",
    startDateTime: DateTime.fromISO(util.t1("19:00")),
    endStation: "Oulu Station",
    endDateTime: DateTime.fromISO(util.t3("10:00")), // 3-day connection
    selected: true,
    color: "purple",
  };

  calendar.updateView([data]);
  await timeout(10);

  const got = util.getShadowDOMItems(container, ".entry-part");
  expect(got.data).toMatchObject([
    {
      column: util.COLUMN_FIRST_DAY,
      rowStart: util.ROW_MIDNIGHT + 19 * 4,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
    {
      column: util.COLUMN_FIRST_DAY + 1,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 24 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
    {
      column: util.COLUMN_FIRST_DAY + 2,
      rowStart: util.ROW_MIDNIGHT,
      rowEnd: util.ROW_MIDNIGHT + 10 * 4,
      group: "Berlin->Oulu",
      color: "purple",
      isActive: true,
    },
  ]);

  const gotContents = {
    // header and start info in first part
    connectionIcon: got.elements[0].querySelector(".connection-icon"),
    connectionNumber: got.elements[0].querySelector(".connection-number"),
    startTime: got.elements[0].querySelector(".start .time"),
    startStation: got.elements[0].querySelector(".start .station"),
    // destination info in last part
    destinationTime: got.elements[2].querySelector(".destination .time"),
    destinationStation: got.elements[2].querySelector(".destination .station"),
  };

  expect(gotContents.connectionIcon.src).toContain("train.svg");
  expect(gotContents.connectionNumber.innerHTML).toBe("nachtzug 123");
  expect(gotContents.startTime.innerHTML).toBe("19:00");
  expect(gotContents.startStation.innerHTML).toBe("Berlin Gesundbrunnen");
  expect(gotContents.destinationTime.innerHTML).toBe("10:00");
  expect(gotContents.destinationStation.innerHTML).toBe("Oulu Station");
});
