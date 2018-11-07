import IJsonObject from "./IJsonObject"
import IStateId from "./IStateId"

/**
 * The information which is to be restored from a persistence plugin at startup
 * if possible.
 * @template TState The JSON-serializable type of state restored.
 */
export default interface ISnapshot<TState extends IJsonObject> {
  /**
   * The state restored.
   */
  readonly state: TState

  /**
   * The unique identifier of the state restored.
   */
  readonly stateId: IStateId
}
