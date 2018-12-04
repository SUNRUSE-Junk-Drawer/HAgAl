import IJsonObject from "../../IJsonObject"
import { MultiMessageHandler } from "../../Actors/IMultiMessageHandler"
import IActor from "../../Actors/IActor"
import IApplication from "../IApplication"
import IPlugin from "./IPlugin"

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
     * The plugin to install.
     */
    readonly plugin: IPlugin<TState, TEvent, TApplication>
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

  /**
   * Requests that an event be applied should it not be based upon stale data.
   */
  readonly applyEvent: {
    /**
     * The event to apply to the application state.
     */
    readonly event: TEvent

    /**
     * The ID of the session which generated the event.
     */
    readonly sessionId: string

    /**
     * The application hash at the time of generating the event.
     */
    readonly hash: string

    /**
     * The sender of this message.
     */
    readonly sender: IActor<IPlugin<TState, TEvent, TApplication>>
  }
}
