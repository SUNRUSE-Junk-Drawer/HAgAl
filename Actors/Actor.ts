import { SingleKeyValueOf } from "../ISingleKeyValueOf"
import IActor from "./IActor"
import IMailbox from "./IMailbox"
import { MultiEventHandler } from "./IMultiEventHandler"
import IErrorHandler from "./IErrorHandler"

/**
 * Processes one event at a time.
 * @template TEvents The JSON-serializable types of events.
 */
export default class Actor<TEvents> implements IActor<TEvents> {
  private running = false

  /**
   * @param mailbox The mailbox to use.
   * @param multiEventHandler The handlers for events processed by the actor.
   * @param errorHandler The handler for errors raised while processing events.
   */
  constructor(
    private readonly mailbox: IMailbox<SingleKeyValueOf<TEvents>>,
    private readonly multiEventHandler: MultiEventHandler<TEvents>,
    private readonly errorHandler: IErrorHandler
  ) { }

  /**
   * @inheritdoc
   */
  tell(event: SingleKeyValueOf<TEvents>): void {
    if (this.running) {
      this.mailbox.push(event)
    } else {
      this.running = true
      this.multiEventHandler[event.key](event.value).then(
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
