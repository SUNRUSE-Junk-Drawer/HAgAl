/**
 * A JSON-serializable array.
 */
interface IJsonArray extends ReadonlyArray<Json> { }

/**
 * A JSON-serializable value.
 */
type Json =
  | string
  | number
  | boolean
  | IJsonArray
  | IJsonObject
  | null

/**
 * A JSON-serializable object.
 */
export default interface IJsonObject {
  readonly [key: string]: Json
}
