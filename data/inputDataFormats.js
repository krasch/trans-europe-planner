/**
 * @typedef Geo
 * @type {object}
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef City
 * @type {object}
 * @property {string} name
 * @property {Geo} geo
 * @property {boolean} isDestination
 */

/**
 * @typedef Stop
 * @type {object}
 * @property {string} name
 * @property {Geo} geo
 * @property {string} cityId
 * @property {string} country
 * @property {string[]} motisIds
 * @property {boolean} secondary
 */

/**
 * @typedef StopTime
 * @type {object}
 * @property {string} stopId
 * @property {string} arrivalTime
 * @property {string} departureTime
 */

/**
 * @typedef Connection
 * @type {object}
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {StopTime[]} stops
 */
