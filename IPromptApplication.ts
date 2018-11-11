import IJsonObject from "./IJsonObject"
import IPrompt from "./IPrompt"

/**
 * Implemented to generate prompts from application state.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPromptApplication<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > {
  /**
   * Generates a prompt to show from a state and viewing session ID.
   * @param state The state from which to generate a prompt.
   * @param sessionId The viewing session ID for which to generate a prompt.
   * @returns A new prompt generated from the given state and viewing session
   * ID.
   */
  view(state: TState, sessionId: string): IPrompt<TEvent>

  /**
   * Generates a string which is compared to determine whether a user's view
   * needs to be refreshed.
   * @param state The state from which to generate a prompt.
   * @param sessionId The viewing session ID for which to generate a prompt.
   * @returns A string which changes only when the user's view needs to be
   * refreshed.
   */
  hash(state: TState, sessionId: string): string
}
