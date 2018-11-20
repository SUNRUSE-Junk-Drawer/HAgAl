import IJsonObject from "./IJsonObject"

/**
 * Processes one event at a time.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IActor<TEvent extends IJsonObject> {
  /**
   * Enqueues an event to process.
   * @param event The event to process.
   */
  tell(event: TEvent): void
}
