/**
 * Used internally to allow for exactly one key/value to be selected.
 */
type SingleKeyValueOf<T> = {
  readonly [key in keyof T]:
  {
    /** Indicates the type of value included. */
    readonly key: key,

    /** The value included. */
    readonly value: T[key]
  }
}[keyof {
  readonly [key in keyof T]:
  {
    /** Indicates the type of value included. */
    readonly key: key,

    /** The value included. */
    readonly value: T[key]
  }
}]

export default SingleKeyValueOf
