/**
 * A set of functions which may be called to perform logging.
 */
export default interface ILogger {
  /**
   * Logs a message deemed unimportant.  Likely safe to drop.
   * @param message The message to log.
   */
  verbose(message: string): void

  /**
   * Logs a message which indicates that an important event occurred.
   * @param message The message to log.
   */
  information(message: string): void

  /**
   * Logs a message which may (but does not necessarily) indicate an error.
   * @param message The message to log.
   */
  warning(message: string): void

  /**
   * Logs a message which indicates that a serious error has occurred.
   * @param message The message to log.
   */
  error(message: string): void
}
