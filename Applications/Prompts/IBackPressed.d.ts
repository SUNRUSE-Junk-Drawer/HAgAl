/**
 * Instructs that a user has pressed the back button on their prompt.
 */
export default interface IBackPressed {
  /**
   * Indicates the event type.
   */
  readonly type: `backPressed`

  /**
   * The session ID of the user which has pressed the back button on their
   * prompt.
   */
  readonly sessionId: string

  /**
   * The hash of the prompt on which the back button was pressed.
   */
  readonly hash: string
}
