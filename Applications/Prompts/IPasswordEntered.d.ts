/**
 * Instructs that a user has entered a password into a prompt.
 */
export default interface IPasswordEntered {
  /**
   * Indicates the event type.
   */
  readonly type: `passwordEntered`

  /**
   * The session ID of the user which has entered a password into a prompt.
   */
  readonly sessionId: string

  /**
   * The hash of the prompt into which a password was entered.
   */
  readonly hash: string

  /**
   * The password which was entered.
   */
  readonly password: string
}
