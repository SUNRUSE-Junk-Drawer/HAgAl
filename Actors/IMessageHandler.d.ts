/**
 * Defines how an actor handles a message.
 * @template TMessages The handled message type.
 */
export default interface IMessageHandler<TMessage> {
  /**
   * Defines how an actor handles a message.
   * @param message The message to handle.
   * @returns Rejections will be passed to IErrorHandler.
   */
  (message: TMessage): Promise<void>
}
