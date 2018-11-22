import IJsonObject from "./../../IJsonObject"
import IPluginInstance from "./IPluginInstance"

/**
 * The result of creating a plugin instance.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPluginCreated<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > {
  /**
   * The application state to pass to the next plugin (or use if last).
   */
  readonly state: TState

  /**
   * The created plugin instance.
   */
  readonly instance: IPluginInstance<TState, TEvent>
}
