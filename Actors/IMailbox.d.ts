import { SingleKeyValueOf } from "../ISingleKeyValueOf"

/**
 * A FIFO queue of messages to be processed by an actor.  Implemented by arrays.
 * @template TMessages The handled message type.
 */
export default interface IMailbox<TMessages> {
  /**
   * Retrieves the next message from the queue, if any.
   * @returns The next message, if any, else, undefined.
   */
  shift(): undefined | SingleKeyValueOf<TMessages>

  /**
   * Adds an message to the queue.
   * @param message The message to add to the queue.
   */
  push(message: SingleKeyValueOf<TMessages>): void
}
