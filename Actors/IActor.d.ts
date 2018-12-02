import { SingleKeyValueOf } from "../ISingleKeyValueOf"

/**
 * Processes one message at a time.
 * @template TMessages The handled message types.
 */
export default interface IActor<TMessages> {
  /**
   * Enqueues a message to process.
   * @param key The type of message to process.
   * @param value The message body to process.
   */
  tell<TKey extends keyof TMessages>(
    key: TKey,
    value: TMessages[TKey]
  ): void
}
