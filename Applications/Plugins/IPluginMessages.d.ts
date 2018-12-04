import IJsonObject from "../../IJsonObject"
import IReadOnlyStateContainer from "../../State/IReadOnlyStateContainer"
import ILoggerProxy from "../../Logging/ILoggerProxy"
import IActor from "../../Actors/IActor"
import IApplication from "../IApplication"
import ICoreMessages from "./ICoreMessages"

/**
 * Messages which can be sent to the core which hosts an application and its
 * surrounding plugins.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type hosted.
 */
export default interface IPluginMessages<
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
    readonly core: IActor<ICoreMessages<TState, TEvent, TApplication>>

    /**
     * The application which the core is hosting.
     */
    readonly application: TApplication

    /**
     * A reference to the (atomically updated, but mutable) current application
     * state.
     */
    readonly state: IReadOnlyStateContainer<TState>

    /**
     * The logger to use.
     */
    readonly logger: ILoggerProxy
  }

  /**
   * A notification that the application state has changed.
   */
  readonly stateChanged: {
    /**
     * The application state changed to.
     */
    readonly state: TState

    /**
     * The event which changed the application state, if any.
     */
    readonly event: null | TEvent
  }

  /**
   * A notification that an event was rejected as it was based upon stale state.
   */
  readonly stateStale: {
    /**
     * The ID of the session from which an event was rejected.
     */
    readonly sessionId: string

    /**
     * The application state at the time of rejecting the event.
     */
    readonly state: TState

    /**
     * The application hash at the time of generating the event which was
     * discarded.
     */
    readonly staleHash: string

    /**
     * The application hash at the time of processing the event which was
     * discarded.
     */
    readonly freshHash: string
  }
}
