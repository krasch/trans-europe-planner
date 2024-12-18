function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  updateElement(element, templateData);

  return element;
}

function updateElement(element, data) {
  for (let selector in data) {
    const children = element.querySelectorAll(selector);

    for (let child of children) {
      for (let key in data[selector]) {
        child[key] = data[selector][key];
      }
    }
  }
}

function* calculateDiffs(oldObjectOfObjects, newObjectOfObjects) {
  for (let id in oldObjectOfObjects) {
    // this id is not present in the new object
    if (newObjectOfObjects[id] === undefined) {
      // -> mark all keys in the old object removed
      for (let key in oldObjectOfObjects[id]) {
        yield { kind: "removed", id: id, key: key, newValue: null };
      }
      continue;
    }

    // the id is present both in old and in new object
    for (let key in oldObjectOfObjects[id]) {
      // this key for this id is not present in new object
      if (newObjectOfObjects[id][key] === undefined)
        // -> mark this key as removed
        yield { kind: "removed", id: id, key: key, newValue: null };
      // this key for this id is present in both old and new and it has changed
      else if (newObjectOfObjects[id][key] !== oldObjectOfObjects[id][key])
        // -> mark this key as updated
        yield {
          kind: "updated",
          id: id,
          key: key,
          newValue: newObjectOfObjects[id][key],
        };
    }
  }

  for (let id in newObjectOfObjects) {
    // this id is not present in the old object
    if (oldObjectOfObjects[id] === undefined) {
      // -> mark all keys in the new object as added
      for (let key in newObjectOfObjects[id])
        yield {
          kind: "added",
          id: id,
          key: key,
          newValue: newObjectOfObjects[id][key],
        };
      continue;
    }

    // this id is present in both old and new object
    for (let key in newObjectOfObjects[id]) {
      // this key for this id is not present in old object
      if (oldObjectOfObjects[id][key] === undefined) {
        // -> mark this key as added
        yield {
          kind: "added",
          id: id,
          key: key,
          newValue: newObjectOfObjects[id][key],
        };
      }

      // do not need to check for changes here because already did this in first for loop
    }
  }
}

function groupDiffsById(diffs) {
  const grouped = {};

  for (let diff of diffs) {
    if (grouped[diff.id] === undefined) grouped[diff.id] = [];
    grouped[diff.id].push(diff);
  }
  return grouped;
}

function filterDiffs(diffs, keys) {
  return diffs.filter((d) => keys.includes(d.key));
}

class StateManager {
  #defaults;
  #states;
  #initialized = false;

  constructor(defaults = undefined) {
    this.#defaults = defaults;
    this.#states = {};

    if (this.#defaults === undefined) this.#initialized = true;
  }

  setToDefaults() {
    this.#initialized = true;

    if (this.#defaults === undefined) return [];

    const diffs = [];
    for (let id in this.#defaults) {
      for (let key in this.#defaults[id]) {
        diffs.push({
          kind: "added",
          id: id,
          key: key,
          newValue: this.#defaults[id][key],
        });

        this.#states[id] = {};
        this.#states[id][key] = this.#defaults[id][key];
      }
    }

    return diffs;
  }

  update(newStates) {
    if (!this.#initialized) throw new Error("Must run .setToDefaults() first");

    let diffs = Array.from(calculateDiffs(this.#states, newStates));

    for (let i in diffs) {
      const diff = diffs[i];
      const id = diff.id;
      const key = diff.key;

      // first time we are seeing this id
      if (this.#states[id] === undefined) this.#states[id] = {};

      // apply update to the state
      if (diff.kind === "updated" || diff.kind === "added")
        this.#states[id][key] = diff.newValue;
      else if (diff.kind === "removed") {
        // need to fall back to a default value -> rewrite "removed" as "updated"
        if (this.#hasDefault(id, key)) {
          // already at default, this is not actually a diff
          // todo there are quite a bunch of these, perhaps just integrate diff calc here to avoid?
          if (this.#states[id][key] === this.#defaults[id][key])
            diffs[i].kind = "____"; // filter these out later
          else {
            diffs[i].kind = "updated";
            diffs[i].newValue = this.#defaults[diff.id][diff.key];
            this.#states[diff.id][diff.key] = diff.newValue;
          }
        }
        // no default value -> remove from state
        else delete this.#states[diff.id][diff.key];
      }
    }

    return diffs.filter((d) => d.kind !== "____");
  }

  getDefault(id) {
    return this.#defaults[id];
  }

  #hasDefault(id, key) {
    return (
      this.#defaults !== undefined &&
      this.#defaults[id] !== undefined &&
      this.#defaults[id][key] !== undefined
    );
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.calculateDiffs = calculateDiffs;
  module.exports.groupDiffsById = groupDiffsById;
  module.exports.StateCollection = StateManager;
}
