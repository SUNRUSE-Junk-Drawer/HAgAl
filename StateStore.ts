import IStateStore from "./IStateStore"

/**
 * @inheritdoc
 */
export default class StateStore<T> implements IStateStore<T> {
  private readonly states: T[] = []

  /**
   * @inheritdoc
   */
  add(state: T): void {
    this.states.push(state)
  }

  /**
   * @inheritdoc
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
