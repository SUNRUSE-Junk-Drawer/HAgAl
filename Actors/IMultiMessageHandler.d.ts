import IMessageHandler from "./IMessageHandler"

/**
 * Defines how an actor handles a set of messages.
 * @template TMessages The handled message types.
 */
export type MultiMessageHandler<TMessages> = {
  /**
   * A handler for a message type.
   */
  readonly [key in keyof TMessages]: IMessageHandler<TMessages[key]>
}
