/**
 * @param {string} templateId
 * @param {Object<string, object>} templateData
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

/**
 *
 * @param {Element} container
 * @param {Object<string, object>} data
 */
export function updateElement(container, data) {
  for (let selector in data) {
    let matches = null;

    // we are changing the root element (the container itself)
    if (selector === ".") matches = [container];
    // we are changing children of the container
    else matches = container.querySelectorAll(selector);

    for (let [key, value] of Object.entries(data[selector])) {
      // updating dataset, should be "data-key:value"
      if (key.startsWith("data"))
        matches.forEach((e) => e.setAttribute(key, value));
      // updating everything else
      else matches.forEach((e) => (e[key] = value));
    }
  }
}

/**
 * @template T
 * @param {T[]} array
 * @param {function} keyFn - the function by which to group
 * @returns {Object.<any,T[]>}
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

/** @template K,V */
export class DefaultMap extends Map {
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

/**
 * @template T
 * @param {T[]} array1
 * @param {T[]} array2
 * @return {T[]}
 */
export function intersection(array1, array2) {
  const result = [];
  for (let item of array1) {
    if (array2.includes(item)) result.push(item);
  }
  return result;
}
