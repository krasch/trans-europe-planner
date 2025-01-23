/**
 * @jest-environment jsdom
 */

const util = require("./calendarTestUtils");

beforeEach(() => util.createDocument());

test("when hovering over a part of multiparty entry, then all parts should hover", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  // by default no part should hover
  let got = util.getShadowDOMItems(calendar, ".entry-part");
  expect(got.data.map((e) => e.isHover)).toStrictEqual([false, false, false]);

  // after mouseover all parts should hover
  await util.dispatchEvent(got.elements[0], "mouseover");
  expect(got.data.map((e) => e.isHover)).toStrictEqual([true, true, true]);

  // after mouseout no parts should hover
  await util.dispatchEvent(got.elements[2], "mouseout");
  expect(got.data.map((e) => e.isHover)).toStrictEqual([false, false, false]);
});

test("hover on/off callback should be called when hovering over entry", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const hoverOnCallback = jest.fn();
  const hoverOffCallback = jest.fn();
  calendar.on("hoverOn", hoverOnCallback);
  calendar.on("hoverOff", hoverOffCallback);

  let parts = util.getShadowDOMItems(calendar, ".entry-part");

  // send mouseover on first part of entry
  await util.dispatchEvent(parts.elements[0], "mouseover");
  expect(hoverOnCallback).toBeCalledWith(entry);

  // send mouseout on third part of entry
  await util.dispatchEvent(parts.elements[2], "mouseout");
  expect(hoverOffCallback).toBeCalledWith(entry);
});

test("drag and drop of multi-part entries", async function () {
  const group = "Berlin->München";
  const other = "München->Verona";

  const entries = [
    // first two entries are from the same group and can be dragged/dropped
    util.createEntry(util.t1("16:29"), util.t2("18:04"), {
      group: group,
      active: true,
    }),
    util.createEntry(util.t2("16:29"), util.t3("18:04"), {
      group: group,
      active: false,
    }),
    // third entry is from a different group and should not interact with first group
    util.createEntry(util.t1("04:30"), util.t1("05:11"), {
      group: other,
      active: true,
    }),
  ];

  const calendar = document.querySelector("#calendar");
  for (let e of entries) await calendar.appendChild(e);

  const got = util.getShadowDOMItems(calendar, ".entry-part");
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
        "indicator",
        "indicator",
        "indicator",
        undefined,
      ],
      e1indicator_e2preview: [
        "indicator",
        "indicator",
        "preview",
        "preview",
        undefined,
      ],
      e1preview_e2indicator: [
        "preview",
        "preview",
        "indicator",
        "indicator",
        undefined,
      ],
    },
  };

  // initial values
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  /// when starting dragging e1, it should turn inactive and e1 and e2 should show indicators
  await util.dispatchEvent(elements.e1.part1, "dragstart");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1preview_e2indicator);

  // when dragentering e2, it should become preview
  await util.dispatchEvent(elements.e2.part2, "dragenter");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1indicator_e2preview);

  // after dragleaving e2, both e1 and e2 should be indicator
  await util.dispatchEvent(elements.e2.part1, "dragleave");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when dragentering e3, nothing should happen
  await util.dispatchEvent(elements.e3.part1, "dragenter");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when dragleaving e3, nothing should happen either
  await util.dispatchEvent(elements.e3.part1, "dragleave");
  expect(got.all.isActive).toStrictEqual(exp.status.only_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1_and_e2_indicator);

  // when drop is canceled, it should snap back to e1 being active
  // need to dispatch the dragend over e1, in reality this is not necessary
  await util.dispatchEvent(elements.e1.part1, "dragend");
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  // dragging e1 to e2 -> e2 should become active
  await util.dispatchEvent(elements.e1.part1, "dragstart");
  await util.dispatchEvent(elements.e2.part2, "drop");
  expect(got.all.isActive).toStrictEqual(exp.status.e2_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);

  // dragging e2 to e2 -> e1 should become active
  await util.dispatchEvent(elements.e2.part2, "dragstart");
  await util.dispatchEvent(elements.e1.part1, "dragenter");
  expect(got.all.dragStatus).toStrictEqual(exp.drag.e1preview_e2indicator);
  await util.dispatchEvent(elements.e1.part2, "drop");
  expect(got.all.isActive).toStrictEqual(exp.status.e1_and_e3_active);
  expect(got.all.dragStatus).toStrictEqual(exp.drag.all_undefined);
});

test("drag and drop after changing entry group", async function () {
  const entries = [
    util.createEntry(util.t1("16:29"), util.t1("18:04"), {
      group: "group1",
      active: true,
    }),
    util.createEntry(util.t2("16:29"), util.t2("18:04"), {
      group: "group2",
      active: true,
    }),
  ];

  const calendar = document.querySelector("#calendar");
  for (let e of entries) await calendar.appendChild(e);

  entries[1].dataset.group = "group1"; // now have the same group and should be drag&droppable
  await util.timeout(10); // give calendar time to update

  const got = util.getShadowDOMItems(calendar, ".entry-part");
  await util.dispatchEvent(got.elements[0], "dragstart");
  expect(got.all.dragStatus).toStrictEqual(["preview", "indicator"]);
});

test("drop callback should be called after drop occurs", async function () {
  const entry = util.createEntry(util.t1("16:29"), util.t3("18:04"));

  const calendar = document.querySelector("#calendar");
  await calendar.appendChild(entry);

  const dropCallback = jest.fn();
  calendar.on("drop", dropCallback);

  let parts = util.getShadowDOMItems(calendar, ".entry-part");

  await util.dispatchEvent(parts.elements[0], "dragstart");
  await util.dispatchEvent(parts.elements[1], "dragenter");
  await util.dispatchEvent(parts.elements[2], "drop");
  expect(dropCallback).toBeCalledWith(entry);
});

test("can set group hover state from outside calendar", async function () {
  const entries = [
    util.createEntry(util.t1("16:29"), util.t1("18:04"), {
      group: "group1",
    }),
    util.createEntry(util.t2("16:29"), util.t2("18:04"), {
      group: "group2",
    }),
  ];

  const calendar = document.querySelector("#calendar");
  for (let entry of entries) await calendar.appendChild(entry);

  const parts = util.getShadowDOMItems(calendar, ".entry-part");

  calendar.setHoverGroup("group2");
  expect(parts.all.isHover).toStrictEqual([false, true]);

  calendar.setNoHoverGroup("group2");
  expect(parts.all.isHover).toStrictEqual([false, false]);
});
