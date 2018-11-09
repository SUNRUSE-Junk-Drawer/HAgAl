import IJsonObject from "./IJsonObject"

/**
 * The interface between the core and a plugin.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPluginHandler<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > {
  /**
   * Gets the latest state.
   * @returns The latest state.
   */
  state(): Promise<TState>

  /**
   * Applies an event to the latest state.
   * @param event The event to apply.
   * @returns When the event has been processed by all plugins.
   */
  apply(event: TEvent): Promise<void>
}
