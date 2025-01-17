const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

const NUM_DAYS = 3;
const RESOLUTION = 4; // "slices" per hour

const style = `
<style>

:host {
  /* the following can be set in external css to style this custom element */
  --calendar-lines: 1px dashed lightgrey;
  --calendar-text-color: darkgrey;
  
  width: 100%;
  display: grid;
  font-size: 0.8rem;
  
  --header-rows: 8;
  --num-rows: calc(24 * ${RESOLUTION});
  --row-height: 0.3rem; /* instead set max height externally? */
  
  grid-auto-flow: column; /* do I even need the below ?*/
  grid-template-rows: 3rem repeat(var(--num-rows), var(--row-height));
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

.entry-part {
  --color: 128,128,128;
  overflow: hidden;
  border-radius: 10px;
  visibility: hidden;
}
.entry-part[data-status=active] {
  visibility: visible;
  border: 1px solid darkgrey;
  background-color: rgba(var(--color), 0.6);
}
.entry-part[data-status=active].hover {
  background-color: rgba(var(--color), 0.8);
}
/* faint highlight to show that dropping is possible here */
.entry-part[data-drag-status=indicator] {
  visibility: visible;
  border-top: 1px dashed rgba(var(--color));
  border-radius: 0;
}
.entry-part[data-drag-status=indicator] > * {
  visibility: hidden; 
}
/* drag&drop mode and user is hovering over this drop zone */
.entry-part[data-drag-status=preview] {
  visibility: visible;
  background-color: rgba(var(--color), 0.8);
}
.entry-part[data-drag-status=preview] > * {
  visibility: hidden;
}
</style>`;

function formatDateLabel(startDateString, offset) {
  const date = new Date(startDateString);
  date.setDate(date.getDate() + Number(offset));

  const weekday = date.toLocaleString(LOCALE, { weekday: "short" });
  const dateString = date.toLocaleString(LOCALE, {
    month: "short",
    day: "numeric",
  });
  return `${weekday} <br/> ${dateString}`;
}

// todo test onDropCallback
function enableDragAndDrop(calendar, onDropCallback) {
  const emptyDragImage = new Image();
  emptyDragImage.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

  // use this function to set up an event listener that only gets called back
  // when the entry is a valid drop target
  const addFilteredEventListener = (type, callback) => {
    calendar.addEntryEventListener(type, (e, entry, groupEntries) => {
      // the "group" attributes of the element being dragged (source)
      // chrome only allows us to access the getData in drop event -> workaround
      let groupSource = e.dataTransfer.types[0];

      // and the group attribute where the mouse is currently over (target)
      const groupTarget = entry.group;

      // both group attributes must be the same
      // group source might be lower-case due to chrome workaround
      // -> compare in lower case
      if (groupSource.toLocaleLowerCase() === groupTarget.toLocaleLowerCase())
        callback(e, entry, groupEntries);
    });
  };

  calendar.addEntryEventListener("dragstart", (e, entry, groupEntries) => {
    e.dataTransfer.setDragImage(emptyDragImage, 0, 0);

    // chrome workaround, important that this is not inside the timeout
    e.dataTransfer.setData(entry.group, entry.group);

    // another chrome-workaround, otherwise it directly fires dragend event
    setTimeout(() => {
      e.dataTransfer.dropEffect = "move";

      entry.active = false;
      for (let entry_ of groupEntries) entry_.dragStatus = "indicator";
    }, 10);
  });

  // enters a valid drop target
  addFilteredEventListener("dragenter", (e, entry) => {
    e.preventDefault();
    entry.dragStatus = "preview";
  });

  // this event is fired every few hundred milliseconds
  addFilteredEventListener("dragover", (e) => {
    e.preventDefault();
  });

  // leaves a valid drop target
  addFilteredEventListener("dragleave", (e, entry) => {
    e.preventDefault();
    entry.dragStatus = "indicator";
  });

  // drop finished
  addFilteredEventListener("drop", (e, entry, groupEntries) => {
    e.preventDefault();

    entry.active = true;
    for (let entry_ of groupEntries) entry_.dragStatus = null;

    onDropCallback(entry);
  });

  // no drop event fired, drag&drop was aborted -> reset
  addFilteredEventListener("dragend", (e, entry, groupEntries) => {
    e.preventDefault();

    // todo what else could it be besides "none"?
    if (e.dataTransfer.dropEffect === "none") {
      entry.active = true;
      for (let entry_ of groupEntries) entry_.dragStatus = null;
    }
  });
}

class MultipartCalendarEntry {
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

  // todo move to drag&drop?
  set dragStatus(status) {
    // indicator is a special case, because line should only be on top of first part
    if (status === "indicator") {
      this.dragStatus = null; // unset all (recursive call)
      this.parts[0].dataset.dragStatus = "indicator";
    }
    // unset drag status for all parts
    else if (status === null) {
      for (let part of this.parts) delete part.dataset.dragStatus;
    }
    // all other statuses just set for all parts
    else {
      for (let part of this.parts) part.dataset.dragStatus = status;
    }
  }
}

class LookupUtil {
  // using map because can use complex keys (e.g. HTML elements)

  // maps from external HTML element to internal MultipartCalendarEntry
  #externalToMultipart = new Map();
  // maps from a part HTML element to its parent MultipartCalendarEntry
  #partToParent = new Map();
  // maps from string group name to all MultipartCalendarEntries with this group
  #groupToMultipart = new Map();

  entry = (externalElement) => this.#externalToMultipart.get(externalElement);
  parent = (partElement) => this.#partToParent.get(partElement);
  entriesWithGroup = (group) => this.#groupToMultipart.get(group);

  register(externalHTMLElement, multipartCalendarEntry) {
    this.#externalToMultipart.set(externalHTMLElement, multipartCalendarEntry);

    for (let partElement of multipartCalendarEntry.parts)
      this.#partToParent.set(partElement, multipartCalendarEntry);

    const group = multipartCalendarEntry.group;
    if (!this.#groupToMultipart.has(group))
      this.#groupToMultipart.set(group, []);
    this.#groupToMultipart.get(group).push(multipartCalendarEntry);
  }

  unregister(externalHTMLElement) {
    /*const parts = this.#externalToMultipart[externalHTMLElement];
    for (let part of parts) delete this.#partToParent[part];
    delete this.#externalToMultipart[externalHTMLElement];
    // todo remove group to multipart*/
  }
}

class TravelCalendar extends HTMLElement {
  static observedAttributes = ["start-date"];

  //static #observedStyles = ["visibility", "--color", "border", "border-radius"];

  #lookup = new LookupUtil();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style;

    this.addEntryEventListener("mouseover", (e, entry) => {
      entry.hover = true;
    });
    this.addEntryEventListener("mouseout", (e, entry) => {
      entry.hover = false;
    });

    enableDragAndDrop(this, (closest) => {}); // todo callback
  }

  addEntryEventListener(type, callback) {
    this.shadowRoot.addEventListener(type, (e) => {
      const closestEntryPart = e.target.closest(".entry-part");
      if (!closestEntryPart) return;

      const entry = this.#lookup.parent(closestEntryPart);
      const group = this.#lookup.entriesWithGroup(entry.group);
      callback(e, entry, group);
    });
  }

  get startDate() {
    return this.getAttribute("start-date");
  }

  set startDate(date) {
    this.setAttribute("start-date", date);
  }

  connectedCallback() {
    this.#drawGrid();

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        // children added/removed
        // todo this also gives sub-children, can I filter those away?
        if (mutation.type === "childList") {
          for (let node of mutation.addedNodes) {
            if (
              node.tagName === "DIV" &&
              node.classList.contains("calendar-entry")
            )
              this.#addEntry(node);
          }
          for (let node of mutation.removedNodes) {
            if (
              node.tagName === "DIV" &&
              node.classList.contains("calendar-entry")
            )
              this.#removeEntry(node);
          }
        }

        // child attributes changed
        if (mutation.type === "attributes") {
          if (mutation.target.tagName === "DIV") {
            console.log(mutation);
            if (mutation.target.attributeName === "style")
              this.#propagateStyle(mutation.target);
            else {
              this.#removeEntry(mutation.target);
              this.#addEntry(mutation.target);
            }
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

  attributeChangedCallback(name, oldValue, newValue) {
    // start date of calendar changed
    if (name === "start-date" && oldValue !== newValue) {
      // get labels in top-level row, these need to be updated
      const labels = Array.from(
        this.shadowRoot.querySelectorAll(".date-label"),
      );

      // this callback might come before the grid has been initialized
      // in this case labels will be empty, which is not an issue
      // because they will get initialized during connectedCallback
      for (let i in labels) {
        labels[i].innerHTML = formatDateLabel(newValue, i);
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
  }

  #addEntry(externalElement) {
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

    entry.group = externalElement.dataset.group;
    entry.active = externalElement.dataset.active === "active";

    entry.parts[0].appendChild(uiElements.header.cloneNode(true));
    entry.parts[0].appendChild(uiElements.startInfo.cloneNode(true));
    entry.parts.at(-1).appendChild(uiElements.destinationInfo.cloneNode(true));

    this.#lookup.register(externalElement, entry);
  }

  #removeEntry(travelOption) {
    /*for (let part of this.#lookup.entry(travelOption).parts)
      this.shadowRoot.removeChild(part);
    this.#lookup.unregister(travelOption);*/
  }

  #propagateStyle(travelOption) {
    /*const entry = this.#entries.get(travelOption);
    const style = window.getComputedStyle(travelOption);
    for (let key of TravelCalendar.#observedStyles) {
      entry.style.setProperty(key, style.getPropertyValue(key));
    }*/
  }

  #getRow(datetime) {
    // todo time zones, dst
    const minute = datetime.getHours() * 60 + datetime.getMinutes();
    return Math.round((minute / 60.0) * RESOLUTION);
  }

  #getColumn(datetime) {
    // todo time zones, dst
    const midnight = new Date(datetime.toDateString());
    const diffMillis = midnight - new Date(this.startDate);
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
    for (let day = 0; day < NUM_DAYS; day++) {
      const element = document.createElement("div");
      element.innerHTML = formatDateLabel(this.startDate, day);
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
}

customElements.define("travel-calendar", TravelCalendar); // todo move to main?

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.TravelCalendar = TravelCalendar;
}
