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

/**
 * @param {any[]} array
 * @param {function} filterFn - should return boolean
 * @returns {number | null}
 */
export function findFirstPosition(array, filterFn) {
  for (let i in array) {
    if (filterFn(array[i])) return Number(i);
  }
  return null;
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
