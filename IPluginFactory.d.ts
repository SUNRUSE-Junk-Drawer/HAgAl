import IJsonObject from "./IJsonObject"
import IActor from "./Actors/IActor"
import IApplication from "./IApplication"
import ILogEvent from "./Logging/ILogEvent"
import IPluginHandler from "./IPluginHandler"
import IPluginCreated from "./IPluginCreated"

/**
 * A factory for plugin instances.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type interfaced with.
 */
export default interface IPluginFactory<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  > {
  /**
   * Describes the plugin for logging.
   */
  readonly name: string

  /**
   * Creates an instance of the plugin.
   * @param application The application under which the plugin is being created.
   * @param logger The logger to use.
   * @param state The state; either the initial state from the application, or
   * processed by a previous plugin in the chain.  Used to allow plugins to
   * control the initial state (sde {@see IPluginCreated.state}), and should not
   * be taken as the actual initial state.
   * @param pluginHandler The interface to the core.
   * @returns An instance of the plugin.
   */
  createInstance(
    application: TApplication,
    logger: IActor<ILogEvent>,
    state: TState,
    pluginHandler: IPluginHandler<TState, TEvent>
  ): Promise<IPluginCreated<TState, TEvent>>
}
