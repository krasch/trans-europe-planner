/**
 * @param {string} templateId
 * @param {Object} templateData
 */
export function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  // @ts-expect-error TS2339
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  updateElement(element, templateData);

  return element;
}

// todo clean up, test, add typehints
export function updateElement(container, data) {
  for (let selector in data) {
    const matches =
      selector === "$root$"
        ? [container]
        : container.querySelectorAll(selector);

    // todo what about dataset, what does key data mean?
    for (let element of matches) {
      for (let key in data[selector]) {
        if (key.startsWith("data"))
          element.setAttribute(key, data[selector][key]);
        else element[key] = data[selector][key];
      }
    }
  }
}

/**
 * @param {any[]} array
 * @param {function} keyFn - the function by which to group
 * @returns {object}
 */
export function groupBy(array, keyFn) {
  const grouped = {};

  for (let entry of array) {
    const key = keyFn(entry);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  return grouped;
}

export function intersection(array1, array2) {
  const result = [];
  for (let item of array1) {
    if (array2.includes(item)) result.push(item);
  }
  return result;
}

/** @template K,V */
export class DefaultMap extends Map {
  // todo tests
  constructor(defaultFn) {
    super();
    this.defaultFn = defaultFn;
  }

  /**
   * @param {K} key
   * @returns {V} value
   */
  get(key) {
    if (!super.has(key)) {
      const value = this.defaultFn();
      console.assert(value !== undefined);
      super.set(key, value);
    }
    return super.get(key);
  }
}

/**
 * @template T
 * @param {T[]} oldArray
 * @param {T[]} newArray
 */
export function calculateDiff(oldArray, newArray) {
  const result = {
    added: [],
    removed: [],
    same: [],
  };

  for (let e of oldArray) {
    if (newArray.includes(e)) result.same.push(e);
    else result.removed.push(e);
  }

  for (let e of newArray) {
    if (!oldArray.includes(e)) result.added.push(e);
  }

  return result;
}
