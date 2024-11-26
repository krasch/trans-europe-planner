function enableDragAndDrop(calendar, onDropCallback) {
  function isValidDropTarget(e) {
    // only drags over a calendar entry are relevant
    const closest = e.target.closest("calendar-entry");
    if (!closest) return;

    // the "group" attributes of the element being dragged (source)
    // chrome only allows us to access the getData in drop event -> workaround
    let groupSource = e.dataTransfer.types[0];

    // and the group attribute where the mouse is currently over (target)
    // group source might be lower-case due to chrome workaround
    const groupTarget = closest.group.toLowerCase();

    // both group attributes must be the same
    return groupSource === groupTarget;
  }

  calendar.addEventListener("dragstart", (e) => {
    // can only drag calendar entries
    const closest = e.target.closest("calendar-entry");
    if (!closest) return;

    // should not be in the timeout
    e.dataTransfer.setData(closest.group, closest.group); // chrome workaraound

    // another chrome-workaround, otherwise it directly fires dragend event
    setTimeout(() => {
      e.dataTransfer.dropEffect = "move";

      for (let alt of calendar.entriesForGroup(closest.group)) {
        if (alt.id !== closest.id) alt.visibility = "indicator";
      }
    }, 10);
  });

  // enters a valid drop target
  calendar.addEventListener("dragenter", (e) => {
    if (!isValidDropTarget(e)) return;
    e.preventDefault();

    const closest = e.target.closest("calendar-entry");
    closest.visibility = "preview";
  });

  // this event is fired every few hundred milliseconds
  calendar.addEventListener("dragover", (e) => {
    if (!isValidDropTarget(e)) return;
    e.preventDefault(); // must do preventDefault so that drop event is fired

    const closest = e.target.closest("calendar-entry");
    closest.visibility = "preview";
  });

  // leaves a valid drop target
  calendar.addEventListener("dragleave", (e) => {
    if (!isValidDropTarget(e)) return;
    e.preventDefault();

    const closest = e.target.closest("calendar-entry");
    closest.visibility = "indicator";
  });

  // drop: from drop target; // dragend: from dragged item
  calendar.addEventListener("drop", (e) => {
    if (!isValidDropTarget(e)) return;
    e.preventDefault();

    const closest = e.target.closest("calendar-entry");

    // hide original item from calendar -> global state, should callback
    onDropCallback(closest.id);
  });

  calendar.addEventListener("dragend", (e) => {
    e.preventDefault();

    // no drop event fired, drag&drop was aborted, redraw previous state
    if (e.dataTransfer.dropEffect === "none") {
      const closest = e.target.closest("calendar-entry");
      onDropCallback(closest.id);
    }
  });
}
