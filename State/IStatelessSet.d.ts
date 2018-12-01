/**
 * A simple store which can be processed using given callbacks.  Implemented by
 * arrays.
 * @template T The type stored.
 */
export default interface IStatelessSet<T> {
  /**
   * Adds a new value to the store.
   * @param value The value to add.
   */
  push(value: T): void

  /**
   * Executes a callback against every stored state.
   * @param handler The callback to execute on every currently stored state.
   */
  forEach(handler: (value: T) => void): void
}
