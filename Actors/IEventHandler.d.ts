/**
 * Defines how an actor handles an event.
 * @template TEvent The type of events.
 */
export default interface IEventHandler<TEvent> {
  /**
   * Defines how an actor handles an event.
   * @param event The event to handle.
   * @returns Rejections will be passed to IErrorHandler.
   */
  handle(event: TEvent): Promise<void>
}
