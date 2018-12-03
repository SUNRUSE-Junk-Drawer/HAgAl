import IReadOnlyStateContainer from "./IReadOnlyStateContainer"

/**
 * A simple container of state which is accessed using (mockable) methods.
 * @template T The type of state stored.
 */
export default interface IStateContainer<T> extends IReadOnlyStateContainer<T> {
  /**
   * Sets the stored state to a given value.
   * @param state The state to set.
   */
  set(state: T): void
}
