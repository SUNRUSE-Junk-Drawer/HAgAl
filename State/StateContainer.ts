import IStateContainer from "./IStateContainer"

/**
 * @inheritdoc
 */
export default class StateContainer<T> implements IStateContainer<T> {
  /**
   * @param state The initial state.
   */
  constructor(
    private state: T
  ) { }

  /**
   * @inheritdoc
   */
  set(state: T): void {
    this.state = state
  }

  /**
   * @inheritdoc
   */
  get(): T {
    return this.state
  }
}
