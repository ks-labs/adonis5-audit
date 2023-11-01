/**
 * Return only the values that have changed
 *
 * @param {object} objectA
 * @param {object} objectB
 * @returns {{oldData, newData}} Object
 */

export function differenceObj(oldData: object, newData: object) {
  let result = { oldData: {}, newData: {} }
  if (!Object.keys(oldData).length) {
    result.newData = newData
  } else {
    for (let prop in oldData) {
      if (newData.hasOwnProperty(prop)) {
        const value1 = oldData[prop]
        const value2 = newData[prop]
        if (value1 !== value2) {
          result.oldData[prop] = value1
          result.newData[prop] = value2
        }
      } else {
      }
    }
  }
  return result
}
