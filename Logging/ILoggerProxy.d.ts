/**
 * Proxies a logger actor, automatically appending an instigator.
 */
export default interface ILoggerProxy {
  /**
   * Deemed unimportant.  Likely safe to drop.
   * @param message The message to log.
   */
  verbose(message: string): void

  /**
   * Indicates that an important event occurred.
   * @param message The message to log.
   */
  information(message: string): void

  /**
   * May (but does not necessarily) indicate an error.
   * @param message The message to log.
   */
  warning(message: string): void

  /**
   * Indicates that a serious error has occured.
   * @param message The message to log.
   */
  error(message: string): void
}
