/**
 * @jest-environment jsdom
 */

const util = require("./calendarTestUtils");
const { CalendarWrapper } = require("../../script/components/calendar2.js");

beforeEach(() => util.createDocument());

test("update view", async function () {
  const container = document.querySelector("#calendar");
  const calendar = new CalendarWrapper(container);

  const data = {
    uniqueId: "ladida",
  };

  calendar.updateView([data]);
  let parts = util.getShadowDOMItems(container, ".entry-part");
  console.log(parts);
});
