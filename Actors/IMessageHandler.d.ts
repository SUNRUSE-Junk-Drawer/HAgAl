import IActor from "./IActor"

/**
 * Defines how an actor handles a message.
 * @template TMessages The handled message types.
 * @template TMessage The handled message type.
 */
export default interface IMessageHandler<TMessages, TMessage> {
  /**
   * Defines how an actor handles a message.
   * @param receivedBy The actor which received the message (for other actors to
   * reply to).
   * @param message The message to handle.
   * @returns Rejections will be passed to IErrorHandler.
   */
  (
    receivedBy: IActor<TMessages>,
    message: TMessage
  ): Promise<void>
}
