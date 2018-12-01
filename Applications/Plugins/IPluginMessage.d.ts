import IJsonObject from "../../IJsonObject"
import StateContainer from "../../State/StateContainer"
import IActor from "../../Actors/IActor"
import IApplication from "../IApplication"
import ICoreMessage from "./ICoreMessage"

/**
 * Messages which can be sent to the core which hosts an application and its
 * surrounding plugins.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type hosted.
 */
export default interface IPluginMessage<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  > {
  /**
   * Confirms that the plugin has been installed into the core.
   */
  readonly installed: {
    /**
     * The core into which the plugin has been installed.
     */
    readonly core: IActor<ICoreMessage<TState, TEvent, TApplication>>

    /**
     * The application which the core is hosting.
     */
    readonly application: TApplication

    /**
     * A reference to the (atomically updated, but mutable) current application
     * state.
     */
    readonly state: StateContainer<TState>
  }
}
