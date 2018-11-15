/**
 * Implements a simple store of states which can be processed using given
 * callbacks.
 * @template T The type of state stored.
 */
export default class StateStore<T> {
  private readonly states: T[] = []

  /**
   * Adds a new state to the store.
   * @param state The state to add.
   */
  add(state: T): void {
    this.states.push(state)
  }

  /**
   * Executes a callback against every currently stored state.
   * @param handler The callback to execute on every currently stored state;
   * returns the next state, or null if that state is to be removed.
   */
  process(handler: (state: T) => T | null): void {
    for (let i = 0; i < this.states.length;) {
      const newState = handler(this.states[i])
      if (newState == null) {
        this.states.splice(i, 1)
      } else {
        this.states[i] = newState
        i++
      }
    }
  }
}
