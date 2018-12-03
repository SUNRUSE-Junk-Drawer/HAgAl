/**
 * A read-only view of a simple container of state which is accessed using
 * (mockable) methods.
 * @template T The type of state stored.
 */
export default interface IReadOnlyStateContainer<T> {
  /**
   * Gets the currently stored state.
   * @returns The currently stored state.
   */
  get(): T
}
