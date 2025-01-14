/**
 * @jest-environment jsdom
 */

const {
  TravelCalendar,
} = require("../../script/components/calendar2/travelCalendar.js");

beforeEach(() => {
  document.body.innerHTML = `<travel-calendar id='calendar' start-date='2024-10-15'></travel-calendar>`;
});

function getGridItems(querySelector) {
  const calendar = document.getElementById("calendar");

  const elements = [];
  for (let el of calendar.shadowRoot.querySelectorAll(querySelector)) {
    elements.push({
      element: el,
      gridColumn: el.style._values["grid-column"],
      gridRowStart: el.style._values["grid-row-start"],
      gridRowEnd: el.style._values["grid-row-end"],
    });
  }
  return elements;
}

test("dateLabelsAtInitialization", function () {
  const got = getGridItems(".date-label");

  expect(got.length).toBe(3);

  expect(got[0].element.innerHTML).toContain("15");
  expect(got[0].gridColumn).toBe(2);
  expect(got[0].gridRowStart).toBe(1);
  expect(got[0].gridRowEnd).toBe(2);

  expect(got[1].element.innerHTML).toContain("16");
  expect(got[1].gridColumn).toBe(3);
  expect(got[1].gridRowStart).toBe(1);
  expect(got[1].gridRowEnd).toBe(2);

  expect(got[2].element.innerHTML).toContain("17");
  expect(got[2].gridColumn).toBe(4);
  expect(got[2].gridRowStart).toBe(1);
  expect(got[2].gridRowEnd).toBe(2);
});

test("dateLabelsAfterDateChanged", function () {
  document.getElementById("calendar").setAttribute("start-date", "2023-03-20");

  const got = getGridItems(".date-label");

  expect(got.length).toBe(3);

  expect(got[0].element.innerHTML).toContain("20");
  expect(got[0].gridColumn).toBe(2);
  expect(got[0].gridRowStart).toBe(1);
  expect(got[0].gridRowEnd).toBe(2);

  expect(got[1].element.innerHTML).toContain("21");
  expect(got[1].gridColumn).toBe(3);
  expect(got[1].gridRowStart).toBe(1);
  expect(got[1].gridRowEnd).toBe(2);

  expect(got[2].element.innerHTML).toContain("22");
  expect(got[2].gridColumn).toBe(4);
  expect(got[2].gridRowStart).toBe(1);
  expect(got[2].gridRowEnd).toBe(2);
});
