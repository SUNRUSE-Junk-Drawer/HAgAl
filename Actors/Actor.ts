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
  private readonly mailbox: IMailbox<TMessages>

  /**
   * @param Mailbox The constructor for the mailbox to use.
   * @param multiMessageHandler The handlers for messages processed by the actor.
   * @param errorHandler The handler for errors raised while processing
   * messages.
   */
  constructor(
    Mailbox: { new(): IMailbox<TMessages> },
    private readonly multiMessageHandler: MultiMessageHandler<TMessages>,
    private readonly errorHandler: IErrorHandler
  ) {
    this.mailbox = new Mailbox()
  }

  /**
   * @inheritdoc
   */
  tell<TKey extends keyof TMessages>(
    key: TKey,
    value: TMessages[TKey]
  ): void {
    if (this.running) {
      this.mailbox.push({ key, value })
    } else {
      this.running = true
      this.multiMessageHandler[key](
        this,
        value
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
      this.tell(nextMessage.key, nextMessage.value)
    }
  }
}
