import { SingleKeyValueOf } from "../ISingleKeyValueOf"

/**
 * Processes one message at a time.
 * @template TMessages The handled message types.
 */
export default interface IActor<TMessages> {
  /**
   * Enqueues a message to process.
   * @param message The message to process.
   */
  tell(message: SingleKeyValueOf<TMessages>): void
}
