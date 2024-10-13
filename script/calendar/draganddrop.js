function enableDragAndDrop(calendar, onDropCallback) {
  function isValidDropTarget(e) {
    // only drags over a calendar entry are relevant
    const closest = e.target.closest("calendar-entry");
    if (!closest) return;

    // the "group" attributes of the element being dragged (source)
    // and the element where the mouse is currently over (target)
    const groupSource = e.dataTransfer.getData("group");
    const groupTarget = closest.group;

    // both group attributes must be the same
    return groupSource === groupTarget;
  }

  calendar.addEventListener("dragstart", (e) => {
    // can only drag calendar entries
    const closest = e.target.closest("calendar-entry");
    if (!closest) return;

    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("group", closest.group);

    for (let alt of calendar.entriesForGroup(closest.group)) {
      if (alt.id !== closest.id) alt.visibility = "indicator";
    }
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
    onDropCallback(closest.group, closest.id);
  });
}
