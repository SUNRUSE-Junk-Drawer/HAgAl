import ILogMessages from "./ILogMessages"

/**
 * Proxies a logger actor, automatically appending an instigator.
 */
export default interface ILoggerProxy {
  /**
   * Forwards a message onto the proxied logger actor.
   * @param key The type of log message.
   * @param message The message to log.
   */
  tell(key: keyof ILogMessages, message: string): void
}
