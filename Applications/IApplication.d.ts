import IJsonObject from "../IJsonObject"

/**
 * Implemented to provide application logic.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IApplication<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > {
  /**
   * A title to show in clients.
   */
  readonly title: string

  /**
   * The initial application state.
   */
  initial(): TState

  /**
   * Generates a new state by applying an event to an existing state.
   * @param state The state to apply an event to.
   * @param event The event to apply to the state.
   * @returns A new state representing that given, after the given event is
   * applied.
   */
  apply(state: TState, event: TEvent): TState
}
