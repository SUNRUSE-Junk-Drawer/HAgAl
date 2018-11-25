/**
 * A FIFO queue of messages to be processed by an actor.  Implemented by arrays.
 * @template TMessages The handled message type.
 */
export default interface IMailbox<TMessage> {
  /**
   * Retrieves the next message from the queue, if any.
   * @returns The next message, if any, else, undefined.
   */
  shift(): undefined | TMessage

  /**
   * Adds an message to the queue.
   * @param message The message to add to the queue.
   */
  push(message: TMessage): void
}
