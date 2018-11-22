import IJsonObject from "../IJsonObject"

/**
 * Defines how an actor handles an event.
 * @template TEvent The JSON-serializable type of events.
 */
export default interface IEventHandler<TEvent extends IJsonObject> {
  /**
   * Defines how an actor handles an event.
   * @param event The event to handle.
   * @returns Rejections will be passed to IErrorHandler.
   */
  handle(event: TEvent): Promise<void>
}
