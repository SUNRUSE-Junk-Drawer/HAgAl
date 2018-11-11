import IJsonObject from "./IJsonObject"
import IDisposable from "./IDisposable"

/**
 * An instance of a plugin.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPluginInstance<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > extends IDisposable {
  /**
   * Notifies the plugin of a state change.
   * @param state The new state (to which the even has been applied).
   * @param event The event which was applied.
   * @returns A promise which will prevent further state changes or plugin
   * processing until resolved.
   */
  stateChanged(state: TState, event: TEvent): Promise<void>
}
