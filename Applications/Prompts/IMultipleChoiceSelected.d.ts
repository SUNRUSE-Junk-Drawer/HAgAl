/**
 * Instructs that a user has selected from a multiple-choice prompt.
 */
export default interface IMultipleChoiceSelected {
  /**
   * Indicates the event type.
   */
  readonly type: `multipleChoiceSelected`

  /**
   * The session ID of the user which has selected from a multiple-choice
   * prompt.
   */
  readonly sessionId: string

  /**
   * The hash of the prompt from which a selection was made.
   */
  readonly hash: string

  /**
   * The label of the option which was selected.
   */
  readonly label: string
}
