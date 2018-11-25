/**
 * Specifies that a message should be logged.
 */
export default interface ILogMessages {
  /**
   * Deemed unimportant.  Likely safe to drop.
   */
  readonly verbose: {
    /**
     * The message to log.
     */
    readonly message: string
  },

  /**
   * Indicates that an important event occurred.
   */
  readonly information: {
    /**
     * The message to log.
     */
    readonly message: string
  },

  /**
   * May (but does not necessarily) indicate an error.
   */
  readonly warning: {
    /**
     * The message to log.
     */
    readonly message: string
  },

  /**
   * Indicates that a serious error has occured.
   */
  readonly error: {
    /**
     * The message to log.
     */
    readonly message: string
  }
}
