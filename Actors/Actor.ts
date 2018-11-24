import IActor from "./IActor"
import IMailbox from "./IMailbox"
import IEventHandler from "./IEventHandler"
import IErrorHandler from "./IErrorHandler"

/**
 * Processes one event at a time.
 * @template TEvent The JSON-serializable type of events.
 */
export default class Actor<TEvent> implements IActor<TEvent> {
  private running = false

  /**
   * @param mailbox The mailbox to use.
   * @param eventHandler The handler for events processed by the actor.
   * @param errorHandler The handler for errors raised while processing events.
   */
  constructor(
    private readonly mailbox: IMailbox<TEvent>,
    private readonly eventHandler: IEventHandler<TEvent>,
    private readonly errorHandler: IErrorHandler
  ) { }

  /**
   * @inheritdoc
   */
  tell(event: TEvent): void {
    if (this.running) {
      this.mailbox.push(event)
    } else {
      this.running = true
      this.eventHandler.handle(event).then(
        () => this.done(),
        reason => {
          this.errorHandler(reason)
          this.done()
        }
      )
    }
  }

  private done(): void {
    this.running = false
    const nextEvent = this.mailbox.shift()
    if (nextEvent) {
      this.tell(nextEvent)
    }
  }
}
