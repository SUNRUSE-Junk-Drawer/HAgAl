/**
 * A simple store of states which can be processed using given callbacks.
 * @template T The type of state stored.
 */
export default interface IStateSet<T> {
  /**
   * Adds a new state to the store.
   * @param state The state to add.
   */
  add(state: T): void

  /**
   * Executes a callback against every currently stored state.
   * @param handler The callback to execute on every currently stored state;
   * returns the next state, or null if that state is to be removed.
   */
  process(handler: (state: T) => T | null): void
}
