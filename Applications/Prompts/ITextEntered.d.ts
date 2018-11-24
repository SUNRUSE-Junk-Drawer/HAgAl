import IJsonObject from "../../IJsonObject"

/**
 * Instructs that a user has entered text into a prompt.
 */
export default interface ITextEntered extends IJsonObject {
  /**
   * Indicates the event type.
   */
  readonly type: `textEntered`

  /**
   * The session ID of the user which has entered text into a prompt.
   */
  readonly sessionId: string

  /**
   * The hash of the prompt into which text was entered.
   */
  readonly hash: string

  /**
   * The text which was entered.
   */
  readonly text: string
}
