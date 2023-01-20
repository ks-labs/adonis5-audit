import { pick } from 'lodash'

/**
 *  Filter the object fields with the props array
 *
 * @param  {} origin - original object to filter
 * @param  {string[]} props - If null or empty will return all fields
 */
export function only(origin, props) {
  if (origin && (props?.length ?? 0) > 0) {
    return pick(origin, props)
  }
  return origin
}
