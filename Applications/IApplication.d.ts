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

  /**
   * Generates a string which is compared to determine whether a user's view
   * needs to be refreshed.
   * @param state The state from which to generate a hash.
   * @param sessionId The viewing session ID for which to generate a hash.
   * @returns A string which changes only when the user's view needs to be
   * refreshed.
   */
  hash(state: TState, sessionId: string): string
}
