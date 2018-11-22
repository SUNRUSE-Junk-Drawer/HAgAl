import IJsonObject from "../IJsonObject"

/**
 * A FIFO queue of events to be processed by an actor.  Implemented by arrays.
 * @template TEvent The JSON-serializable type of events.
 */
export default interface IMailbox<TEvent extends IJsonObject> {
  /**
   * Retrieves the next event from the queue, if any.
   * @returns The next event, if any, else, undefined.
   */
  shift(): undefined | TEvent

  /**
   * Adds an event to the queue.
   * @param event The event to add to the queue.
   */
  push(event: TEvent): void
}
