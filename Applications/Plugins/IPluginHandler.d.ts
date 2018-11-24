import IJsonObject from "../../IJsonObject"
import IActor from "../../Actors/IActor"
import IReplaceState from "./IReplaceState"

/**
 * The interface between the core and a plugin.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPluginHandler<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > extends IActor<
  | IReplaceState<TState>
  > {
  /**
   * Gets the latest state.
   * @returns The latest state.
   */
  state(): TState
}
