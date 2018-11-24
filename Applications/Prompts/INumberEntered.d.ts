/**
 * Instructs that a user has entered a number into a prompt.
 */
export default interface INumberEntered {
  /**
   * Indicates the event type.
   */
  readonly type: `numberEntered`

  /**
   * The session ID of the user which has entered a number into a prompt.
   */
  readonly sessionId: string

  /**
   * The hash of the prompt into which a number was entered.
   */
  readonly hash: string

  /**
   * The number which was entered.
   */
  readonly number: number
}
