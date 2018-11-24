import IJsonObject from "../../IJsonObject"

/**
 * Instructs that the current application state is to be replaced entirely.
 * @template TState The JSON-serializable type of application state.
 */
export default interface IReplaceState<
  TState extends IJsonObject
  > {
  /**
   * Indicates the event type.
   */
  readonly type: `replaceState`

  /**
   * The JSON-serializable application state to replace with.
   */
  readonly state: TState
}
