function updateVisibility(element, isVisible) {
  if (isVisible) element.classList.remove("hidden");
  else element.classList.add("hidden");
}

function updateSourceData(map, sourceName, groupedChanges) {
  const updates = [];

  for (let id in groupedChanges) {
    updates.push({
      id: id,
      addOrUpdateProperties: groupedChanges[id].map((d) => ({
        key: d.key,
        value: d.value,
      })),
    });
  }

  if (updates.length > 0)
    map.getSource(sourceName).updateData({ update: updates });
}

function filterChanges(changes, keys) {
  return changes.filter((c) => keys.includes(c.key));
}

function groupChangesById(changes) {
  const grouped = {};
  for (let change of changes) {
    if (!grouped[change.id]) grouped[change.id] = [];
    grouped[change.id].push(change);
  }
  return grouped;
}

class StateDict {
  #state = {};

  update(updates) {
    const changes = [];

    for (let id in updates) {
      // not seen this id before
      if (!this.#state[id]) this.#state[id] = {};

      for (let key in updates[id]) {
        if (this.#state[id][key] !== updates[id][key]) {
          changes.push({ id: id, key: key, value: updates[id][key] });
        }
        this.#state[id][key] = updates[id][key];
      }
    }
    return changes;
  }

  get(id, key) {
    return this.#state[id][key];
  }

  getAll(id, keys) {
    const result = {};
    for (let key of keys) result[key] = this.#state[id][key];
    return result;
  }

  set(id, key, value) {
    const update = {};
    update[id] = {};
    update[id][key] = value;
    return this.update(update);
  }
}

function animateDropWithBounce(
  map,
  markers,
  initialHeightPixels,
  bounciness,
  callback,
) {
  const speedup = 2;

  const animationStart = document.timeline.currentTime;
  let previousHeight = 1000;

  function update(timestamp) {
    const secondsSinceStart = (timestamp - animationStart) / 1000.0;
    const x = secondsSinceStart * speedup;

    // https://gamedev.stackexchange.com/a/137185
    const height = Math.floor(
      Math.exp(-x) * Math.abs(initialHeightPixels * Math.cos(bounciness * x)),
    );

    for (let m of markers) {
      m.setOffset([0, -height]);
      m.addTo(map);
    }

    // no more changes happening, can stop the animation
    if (height < 1 && previousHeight < 1) {
      if (callback) callback();
      return;
    }

    previousHeight = height;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
