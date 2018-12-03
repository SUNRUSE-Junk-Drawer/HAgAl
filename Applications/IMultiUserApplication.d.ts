import IJsonObject from "../IJsonObject"
import IApplication from "./IApplication"

/**
 * Extends applications to include a mechanism to detect views which need to be
 * refreshed.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IMultiUserApplication<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > extends IApplication<TState, TEvent> {
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
