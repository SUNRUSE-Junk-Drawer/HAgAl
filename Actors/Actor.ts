import { SingleKeyValueOf } from "../ISingleKeyValueOf"
import IActor from "./IActor"
import IMailbox from "./IMailbox"
import { MultiMessageHandler } from "./IMultiMessageHandler"
import IErrorHandler from "./IErrorHandler"

/**
 * Processes one message at a time.
 * @template TMessages The handled message types.
 */
export default class Actor<TMessages> implements IActor<TMessages> {
  private running = false
  private readonly mailbox: IMailbox<SingleKeyValueOf<TMessages>>

  /**
   * @param mailbox The constructor for the mailbox to use.
   * @param multiMessageHandler The handlers for messages processed by the actor.
   * @param errorHandler The handler for errors raised while processing
   * messages.
   */
  constructor(
    mailbox: { new(): IMailbox<SingleKeyValueOf<TMessages>> },
    private readonly multiMessageHandler: MultiMessageHandler<TMessages>,
    private readonly errorHandler: IErrorHandler
  ) {
    this.mailbox = new mailbox()
  }

  /**
   * @inheritdoc
   */
  tell(message: SingleKeyValueOf<TMessages>): void {
    if (this.running) {
      this.mailbox.push(message)
    } else {
      this.running = true
      this.multiMessageHandler[message.key](
        this,
        message.value
      ).then(
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
    const nextMessage = this.mailbox.shift()
    if (nextMessage) {
      this.tell(nextMessage)
    }
  }
}
