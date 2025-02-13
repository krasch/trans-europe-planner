const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

const NUM_DAYS = 3;
const RESOLUTION = 4; // "slices" per hour

const entryStyle = `<style>@import url('/script/customElements/travelCalendar/entry.css')</style>`;

const gridStyle = `<style>

:host {
  /* the following can be set in external css to style this custom element */
  --calendar-lines: 1px dashed lightgrey;
  --calendar-text-color: darkgrey;
  
  width: 100%;
  display: grid;
  font-size: 0.8rem;
  
  --num-rows: calc(24 * ${RESOLUTION});
  
  grid-auto-flow: column; 
  grid-template-rows: 8fr repeat(var(--num-rows), 1fr);
  grid-template-columns: 3rem repeat(${NUM_DAYS}, 1fr);
  
}

:host([hidden]) { 
  display: none 
}

/* styling the calendar grid */
.hour-label {  
  text-align: center; /* horizontally */
  align-content: center; /* vertically*/  
  
  border-top: var(--calendar-lines);
  color: var(--calendar-text-color);
}
.date-label {
  text-align: center; /* horizontally */
  align-content: center; /* vertically*/
  
  border-left: var(--calendar-lines);
  color: var(--calendar-text-color);
}
.cell {
  height: var(--row-height);
  border-left: var(--calendar-lines);
}
.cell.full-hour {
  border-top: var(--calendar-lines);
}
</style>`;

/** This custom element provides a calendar for travel events.
 *
 * Example usage:
 * <travel-calendar start-date="2025-02-01">
 *     <div class="calendar-entry"
 *          data-departure-datetime="2025-02-01T20:00"
 *          data-arrival-datetime="2025-02-02T04:59"
 *          data-active="active"
 *          data-group="Berlin->München"
 *          data-color="27, 158, 119">
 *         <div class="header">Some train from Berlin to Munich</div>
 *         <div class="start">03:14 Berlin</div>
 *         <div class="destination">04:59 München</div>
 *     </div>
 *     <div class="calendar-entry"
 *          data-departure-datetime="2025-02-02T10:00"
 *          data-arrival-datetime="2025-02-02T14:00"
 *          data-active=""
 *          data-group="Berlin->München"
 *          data-color="27, 158, 119">
 *         <div class="header">Some other train from Berlin to Munich</div>
 *         <div class="start">10:00 Berlin</div>
 *         <div class="destination">14:00 München</div>
 *     </div>
 * </travel-calendar>
 *
 * This will:
 * * Draw a calendar grid with 24 rows (one for each hour) and 3 columns (one for each day in
 *   [2025-02-01, 2025-02-02, 2025-02-03]), adding hour labels to the left and date labels at the top.
 *   All necessary HTML elements for the grid are added to the shadow DOM of this element.
 * * Add two calendar entries. The first one being a night train, spanning two columns and the second one
 *   being a day train spanning only one column. The first one will be visible (data-active="active"), the
 *   second one will be hidden. Users can drag the first entry, which will show an indicator of the location
 *   of the second entry, where the user can drop the first entry. This switches the "active" setting from
 *   first entry to the second entry. All entries with the same "data-group" can be swapped out for one another
 *   using this drag&drop mechanism.
 * * Internally, for each entry, one or several HTML elements (called parts) will be created, one part for each column
 *   that this entry spans. The parts will be added to shadow DOM. The ".header" and the ".start" child of the entry
 *   will be copied to the first part, the ".destination" child will be copied to the last part.
 *
 * Known drawbacks:
 * * Entries with the same data-group must be added to this element in the correct sorting order, with the entries
 *   with the earliest data-departure-datetime to be added first. Otherwise, during drag&drop, later entries can overlap
 *   earlier ones, making them unavailable for dropping.
 * */
export class TravelCalendar extends HTMLElement {
  #lookup;
  static observedAttributes = ["start-date"];

  #callbacks = {
    hoverOn: () => {},
    hoverOff: () => {},
    drop: () => {},
  };

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = gridStyle + entryStyle;

    // helps with mapping from entries to parts etc
    this.#lookup = new LookupUtil();

    this.addEntryEventListener("mouseover", (e, entry) => {
      entry.hover = true;
      this.#callbacks.hoverOn(this.#lookup.external(entry));
    });
    this.addEntryEventListener("mouseout", (e, entry) => {
      entry.hover = false;
      this.#callbacks.hoverOff(this.#lookup.external(entry));
    });

    firefoxMobileDragAndDropPolyfill(this);
    enableDragAndDrop(this, (entry) => {
      this.#callbacks.drop(this.#lookup.external(entry));
    });
  }

  connectedCallback() {
    this.#drawGrid();

    // mutations of the external calendar entries
    this.#setupMutationObserver({
      entryAdded: (e) => this.#addEntry(e),
      entryRemoved: (e) => this.#removeEntry(e),
      entryUpdated: (e) => {
        this.#removeEntry(e);
        this.#addEntry(e);
      },
      entryActiveStatusUpdated: (e) => {
        this.#lookup.entry(e).active = e.dataset.active === "active";
      },
      entryColorUpdated: (e) => {
        this.#lookup.entry(e).color = e.dataset.color;
      },
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "start-date" && oldValue !== newValue) {
      this.#changeCalendarStartDate(newValue);
    }
  }

  addEntryEventListener(name, callback) {
    this.shadowRoot.addEventListener(name, (e) => {
      const closestEntryPart = e.target.closest(".entry-part");
      if (!closestEntryPart) return;

      const entry = this.#lookup.parent(closestEntryPart);
      const groupEntries = this.#lookup.entriesWithGroup(entry.group);

      callback(e, entry, groupEntries);
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }

  // todo everything else is done via data attributes, why not this and the next?
  setHoverGroup(group) {
    for (let entry of this.#lookup.entriesWithGroup(group)) entry.hover = true;
  }

  setNoHoverGroup(group) {
    for (let entry of this.#lookup.entriesWithGroup(group)) entry.hover = false;
  }

  #addEntry(externalElement) {
    console.log(externalElement);

    const uiElements = {
      header: externalElement.querySelector(".header"),
      startInfo: externalElement.querySelector(".start"),
      destinationInfo: externalElement.querySelector(".destination"),
    };

    const partsToCreate = this.#splitIntoDays(
      new Date(externalElement.dataset.departureDatetime),
      new Date(externalElement.dataset.arrivalDatetime),
    );

    const entry = new MultipartCalendarEntry(
      partsToCreate.map((p) => {
        const part = document.createElement("div");
        part.draggable = true;
        part.classList.add("entry-part");

        // +1 for header row/index column
        this.#setGridLocation(part, p.column + 1, p.startRow + 1, p.endRow + 1);
        this.shadowRoot.appendChild(part);

        return part;
      }),
    );
    console.log(entry);

    entry.group = externalElement.dataset.group;
    entry.active = externalElement.dataset.active === "active";
    entry.color = externalElement.dataset.color;

    entry.parts[0].appendChild(uiElements.header.cloneNode(true));
    entry.parts[0].appendChild(uiElements.startInfo.cloneNode(true));
    entry.parts.at(-1).appendChild(uiElements.destinationInfo.cloneNode(true));

    entry.parts[0].classList.add("entry-first-part");
    entry.parts.at(-1).classList.add("entry-last-part");

    this.#lookup.register(externalElement, entry);
  }

  #removeEntry(travelOption) {
    for (let part of this.#lookup.entry(travelOption).parts)
      this.shadowRoot.removeChild(part);
    this.#lookup.unregister(travelOption);
  }

  #changeCalendarStartDate(newDate) {
    // update date labels in top-level row
    const labels = Array.from(this.shadowRoot.querySelectorAll(".date-label"));
    for (let i in labels) {
      labels[i].innerHTML = this.#formatDateLabel(newDate, i);
    }

    // also need to update the column in which the parts of the entry lie
    // for now, simple remove the entry and add it again,
    // then all parts should end up at the right place
    const options = Array.from(this.children);
    for (let travelOption of options) {
      this.#removeEntry(travelOption);
      this.#addEntry(travelOption);
    }
  }

  #getRow(datetime) {
    // todo time zones, dst
    const minute = datetime.getHours() * 60 + datetime.getMinutes();
    return Math.round((minute / 60.0) * RESOLUTION);
  }

  #getColumn(datetime) {
    // todo time zones, dst
    const midnight = new Date(datetime.toDateString());
    const diffMillis = midnight - new Date(this.getAttribute("start-date"));
    return Math.round(diffMillis / (1000 * 60 * 60 * 24));
  }

  #setGridLocation(element, column, startRow, endRow) {
    // +1 because grid is one-indexed (not zero-indexed)
    element.style.gridColumn = column + 1;
    element.style.gridRowStart = startRow + 1;
    element.style.gridRowEnd = endRow + 1;
  }

  #splitIntoDays(departureDatetime, arrivalDatetime) {
    const departureColumn = this.#getColumn(departureDatetime);
    const arrivalColumn = this.#getColumn(arrivalDatetime);

    const departureRow = this.#getRow(departureDatetime);
    const arrivalRow = this.#getRow(arrivalDatetime);

    const startOfDayRow = 0;
    const endOfDayRow = 24 * RESOLUTION;

    const parts = [];
    for (let column = departureColumn; column < arrivalColumn + 1; column++) {
      let startRow = startOfDayRow;
      if (column === departureColumn) startRow = departureRow;

      let endRow = endOfDayRow;
      if (column === arrivalColumn) endRow = arrivalRow;

      parts.push({
        column: column,
        startRow: startRow,
        endRow: endRow,
      });
    }

    return parts;
  }

  #drawGrid() {
    // hour labels at left of calendar
    for (let hour = 0; hour < 24; hour++) {
      const element = document.createElement("div");
      element.innerText = `${hour}`.padStart(2, "0");
      element.classList.add("hour-label");

      this.#setGridLocation(
        element,
        0,
        hour * RESOLUTION + 1, // +1 for header row
        (hour + 1) * RESOLUTION + 1, // +1 for header row
      );
      this.shadowRoot.appendChild(element);
    }

    // date labels at top of calendar
    const startDate = this.getAttribute("start-date");
    for (let day = 0; day < NUM_DAYS; day++) {
      const element = document.createElement("div");
      element.innerHTML = this.#formatDateLabel(startDate, day);
      element.classList.add("date-label");

      this.#setGridLocation(
        element,
        day + 1, //+1 for hour column
        0,
        1,
      );
      this.shadowRoot.appendChild(element);
    }

    // grid cells
    for (let day = 0; day < NUM_DAYS; day++) {
      for (let row = 0; row < 24 * RESOLUTION; row++) {
        const element = document.createElement("div");
        element.classList.add("cell");

        if (row % RESOLUTION === 0) element.classList.add("full-hour");

        this.#setGridLocation(
          element,
          day + 1, // +1 for hour column
          row + 1, // +1 for header row
          row + 1 + 1, // + 1 for header row
        );
        this.shadowRoot.appendChild(element);
      }
    }
  }

  #setupMutationObserver(callbacks) {
    const isEntry = (node) =>
      node.tagName === "DIV" && node.classList.contains("calendar-entry");

    const attributeNameToCallback = {
      "data-departure-datetime": callbacks.entryUpdated,
      "data-arrival-datetime": callbacks.entryUpdated,
      "data-group": callbacks.entryUpdated,
      "data-active": callbacks.entryActiveStatusUpdated,
      "data-color": callbacks.entryColorUpdated,
    };

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        if (mutation.type === "childList") {
          for (let node of mutation.addedNodes) {
            if (isEntry(node)) callbacks.entryAdded(node);
          }
          for (let node of mutation.removedNodes) {
            if (isEntry(node)) callbacks.entryRemoved(node);
          }
        }
        if (mutation.type === "attributes") {
          if (isEntry(mutation.target)) {
            attributeNameToCallback[mutation.attributeName](mutation.target);
          }
        }
      }
    });

    observer.observe(this.shadowRoot.host, {
      subtree: true,
      childList: true,
      attributes: true,
    });
  }

  #formatDateLabel(startDateString, offset) {
    const date = new Date(startDateString);
    date.setDate(date.getDate() + Number(offset));

    const weekday = date.toLocaleString(LOCALE, { weekday: "short" });
    const dateString = date.toLocaleString(LOCALE, {
      month: "short",
      day: "numeric",
    });
    return `${weekday} <br/> ${dateString}`;
  }
}

export class MultipartCalendarEntry {
  #group;

  constructor(parts) {
    this.parts = parts;
  }

  set group(group) {
    this.#group = group;
    for (let part of this.parts) part.dataset.group = group;
  }

  get group() {
    return this.#group;
  }

  set color(color) {
    if (!color) return;
    for (let part of this.parts) part.style.setProperty("--color", color);
  }

  set hover(isHover) {
    for (let part of this.parts) {
      if (isHover) part.classList.add("hover");
      else part.classList.remove("hover");
    }
  }

  set active(isActive) {
    const value = isActive ? "active" : "inactive";
    for (let part of this.parts) part.dataset.status = value;
  }

  set dragStatus(status) {
    if (status === null) {
      for (let part of this.parts) delete part.dataset.dragStatus;
    }
    // all other statuses just set for all parts
    else {
      for (let part of this.parts) part.dataset.dragStatus = status;
    }
  }
}

export class LookupUtil {
  // using map because can use complex keys (e.g. HTML elements)

  // maps from external HTML element to internal MultipartCalendarEntry and vice versa
  #externalToMultipart = new Map();
  #multipartToExternal = new Map();
  // maps from a part HTML element to its parent MultipartCalendarEntry
  #partToParent = new Map();
  // maps from string group name to all MultipartCalendarEntries with this group
  // these could also be gotten by just filtering the entries for group name
  // but because this would be called hundreds of times per second during drag&drop
  // it's better to keep this already filtered
  #groupToMultipart = {};
  #knownGroups = new Set();

  entry = (externalElement) => this.#externalToMultipart.get(externalElement);
  external = (multipart) => this.#multipartToExternal.get(multipart);
  parent = (partElement) => this.#partToParent.get(partElement);
  entriesWithGroup = (groupName) => this.#groupToMultipart[groupName];

  register(externalHTMLElement, multipartEntry) {
    this.#externalToMultipart.set(externalHTMLElement, multipartEntry);
    this.#multipartToExternal.set(multipartEntry, externalHTMLElement);

    for (let partElement of multipartEntry.parts)
      this.#partToParent.set(partElement, multipartEntry);

    this.#knownGroups.add(multipartEntry.group);
    this.#updateGroups();
  }

  unregister(externalHTMLElement) {
    const multipartEntry = this.#externalToMultipart.get(externalHTMLElement);
    this.#externalToMultipart.delete(externalHTMLElement);
    this.#multipartToExternal.delete(multipartEntry);

    for (let part of multipartEntry.parts)
      delete this.#partToParent.delete(part);

    this.#knownGroups.add(multipartEntry.group);
    this.#updateGroups();
  }

  #updateGroups() {
    for (let group of this.#knownGroups) {
      this.#groupToMultipart[group] = Array.from(
        this.#externalToMultipart.values(),
      ).filter((e) => e.group === group);
    }
  }
}

function enableDragAndDrop(calendar, onDropCallback) {
  const emptyDragImage = new Image();
  emptyDragImage.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

  let entryCurrentlyBeingDragged = null;

  const isValidDropTarget = (entry) =>
    entryCurrentlyBeingDragged &&
    entry.group === entryCurrentlyBeingDragged.group;

  // in chrome mobile we see two dragstart events for the same entry
  // this is because in the firefox mobile polyfill, we create our own dragstart event out of a touchstart event
  // and then also the system dragstart event arrives in chrome mobile
  // this can't be avoided because we don't know if we are on chrome mobile or firefox mobile,
  // but only the system one has a proper data transfer, which we need to remove the drag image!
  calendar.addEntryEventListener("dragstart", (e, entry, entriesForGroup) => {
    // even if we have seen this dragstart for the second time, let's use the chance to configure data transfer
    // this won't ever happen in firefox mobile, but does not matter because there is no dragimage there anyway
    if (e.dataTransfer) {
      e.dataTransfer.setDragImage(emptyDragImage, 0, 0);
      e.dataTransfer.dropEffect = "move";
    }

    // this is the second time we have seen a dragstart for this entry so nothing more to be done
    if (entryCurrentlyBeingDragged === entry) return;

    for (let entry_ of entriesForGroup) entry_.dragStatus = "indicator";

    entryCurrentlyBeingDragged = entry;
    entryCurrentlyBeingDragged.active = false;
    entryCurrentlyBeingDragged.dragStatus = "preview";
  });

  // enters a drop target
  calendar.addEntryEventListener("dragenter", (e, entry, groupEntries) => {
    if (!isValidDropTarget(entry)) return;
    e.preventDefault();

    for (let entry_ of groupEntries) entry_.dragStatus = "indicator"; // remove previous preview
    entry.dragStatus = "preview";
  });

  // this event is fired every few hundred milliseconds
  calendar.addEntryEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // leaves a drop target
  calendar.addEntryEventListener("dragleave", (e, entry) => {
    if (!isValidDropTarget(entry)) return;
    e.preventDefault();

    entry.dragStatus = "indicator";
  });

  // drop finished
  calendar.addEntryEventListener("drop", (e, entry, entriesForGroup) => {
    if (!isValidDropTarget(entry)) return;
    e.preventDefault();

    entryCurrentlyBeingDragged.active = entryCurrentlyBeingDragged = null;

    entry.active = true;
    for (let entry_ of entriesForGroup) entry_.dragStatus = null;

    onDropCallback(entry);
  });

  // no drop event fired, drag&drop was aborted -> reset
  calendar.addEntryEventListener("dragend", (e, entry, entriesForGroup) => {
    e.preventDefault();

    if (entryCurrentlyBeingDragged) entryCurrentlyBeingDragged.active = true;
    for (let entry_ of entriesForGroup) entry_.dragStatus = null;
  });
}

function firefoxMobileDragAndDropPolyfill(calendar) {
  let currentDropTarget = null;
  let currentlyDragging = false;

  function getEntryPartAtLocation(e) {
    // todo what if there is more than one touch and entry not in first of those??
    const touch = e.changedTouches[0];

    const parts = calendar.shadowRoot
      .elementsFromPoint(touch.clientX, touch.clientY)
      .filter((e) => e.classList.contains("entry-first-part"));

    if (parts.length === 0) return null;

    // todo what if there are multiple parts we are hovering over? should take earliest
    // since currently assuming that earliest events come first, we can ignore this for now
    return parts[0];
  }

  function initEvent(type) {
    return new DragEvent(type, { bubbles: true });
  }

  // this event is also sent by chrome mobile android
  // can not do preventDefault here because then chrome complains
  calendar.addEntryEventListener("touchstart", (e, entry) => {
    currentDropTarget = entry.parts[0];
    currentlyDragging = true;
    currentDropTarget.dispatchEvent(initEvent("dragstart"));
  });

  // observe, this is not addEntryEventListener but addEventListener
  // reason is that we want to avoid chrome from scrolling etc while dragging
  // for this we must also set the passive option, see https://stackoverflow.com/a/49590237
  calendar.addEventListener(
    "touchmove",
    (e) => {
      if (currentlyDragging) e.preventDefault();

      const target = getEntryPartAtLocation(e);

      // we are no longer over a valid drop target
      if (currentDropTarget !== null && target === null) {
        currentDropTarget.dispatchEvent(initEvent("dragleave"));
        currentDropTarget = null;
        return;
      }

      // we were not over a valid drop target, but now we are
      if (currentDropTarget === null && target !== null) {
        currentDropTarget = target;
        currentDropTarget.dispatchEvent(initEvent("dragenter"));
        return;
      }

      // nothing changed
      if (target === currentDropTarget) return;

      // we moved from one valid drop target to another
      currentDropTarget.dispatchEvent(initEvent("dragleave"));
      currentDropTarget = target;
      currentDropTarget.dispatchEvent(initEvent("dragenter"));
    },
    { passive: false },
  );

  // this event is also sent by chrome mobile android
  // can not do preventDefault here because then chrome complains
  calendar.addEntryEventListener("touchend", (e, entry) => {
    // touchend while over valid target -> drop
    if (currentDropTarget) {
      currentDropTarget.dispatchEvent(initEvent("drop"));
      currentDropTarget = null;
    }
    // touchend while not over valid target -> cancel drag&drop
    else {
      entry.parts[0].dispatchEvent(initEvent("dragend"));
    }

    currentlyDragging = false;
  });

  // never actually received a touchcancel from firefox mobile, it just seems to send touchend
  // but chrome mobile android sends it
  //calendar.addEntryEventListener("touchcancel", (e, data) => {});
}
