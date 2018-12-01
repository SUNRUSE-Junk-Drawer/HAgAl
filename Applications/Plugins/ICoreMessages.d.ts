import IJsonObject from "../../IJsonObject"
import { MultiMessageHandler } from "../../Actors/IMultiMessageHandler"
import IApplication from "../IApplication"
import IPluginMessages from "./IPluginMessages"

/**
 * Messages which can be sent to the core which hosts an application and its
 * surrounding plugins.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type hosted.
 */
export default interface ICoreMessages<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  > {
  /**
   * Requests that a plugin be installed into the core.
   */
  readonly install: {
    /**
     * The message handler of the plugin to install.
     */
    readonly plugin: MultiMessageHandler<
      IPluginMessages<TState, TEvent, TApplication>
    >
  }

  /**
   * Requests that the application state be replaced entirely.
   */
  readonly replaceState: {
    /**
     * The application state to use.
     */
    readonly state: TState
  }
}
