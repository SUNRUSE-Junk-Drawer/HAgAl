/**
 * Defines how an actor handles an error.
 */
export default interface IErrorHandler {
  /**
   * Defines how an actor handles an error.  On return, it will process the next
   * message (if any).
   * @param error The error to handle.
   */
  (reason: any): void
}
