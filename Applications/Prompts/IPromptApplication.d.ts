import IJsonObject from "../../IJsonObject"
import IApplication from "../IApplication"
import IPrompt from "./IPrompt"

/**
 * Implemented to generate prompts from application state.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPromptApplication<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > extends IApplication<TState, TEvent> {
  /**
   * Generates a prompt to show from a state and viewing session ID.
   * @param state The state from which to generate a prompt.
   * @param sessionId The viewing session ID for which to generate a prompt.
   * @returns A new prompt generated from the given state and viewing session
   * ID.
   */
  view(state: TState, sessionId: string): IPrompt<TEvent>
}
