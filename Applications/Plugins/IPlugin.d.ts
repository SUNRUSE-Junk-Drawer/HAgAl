import IJsonObject from "../../IJsonObject"
import { MultiMessageHandler } from "../../Actors/IMultiMessageHandler"
import IPluginMessages from "./IPluginMessages"
import IApplication from "../IApplication"

/**
 * Implemented by plugins; a message handler, with additional metadata.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type hosted.
 */
export default interface IPlugin<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  >
  extends MultiMessageHandler<IPluginMessages<TState, TEvent, TApplication>> {
  /**
   * A name for the plugin, used when logging.
   */
  readonly name: string
}
