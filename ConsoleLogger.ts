import ILogger from "./ILogger"

/**
 * Logs to the JavaScript console.
 */
export default class ConsoleLogger implements ILogger {
  /**
   * Enables dependency injection in tests.
   */
  Date: {
    new(): {
      toISOString(): string
    }
  } = Date

  /**
   * Enables dependency injection in tests.
   */
  console: {
    log(message: string): void
    info(message: string): void
    warn(message: string): void
    error(message: string): void
  } = console

  /**
   * @inheritdoc
   */
  verbose(message: string): void {
    this.console.log(`Verbose@${new this.Date().toISOString()}: ${message}`)
  }

  /**
   * @inheritdoc
   */
  information(message: string): void {
    this.console.info(`Information@${new this.Date().toISOString()}: ${message}`)
  }

  /**
   * @inheritdoc
   */
  warning(message: string): void {
    this.console.warn(`Warning@${new this.Date().toISOString()}: ${message}`)
  }

  /**
   * @inheritdoc
   */
  error(message: string): void {
    this.console.error(`Error@${new this.Date().toISOString()}: ${message}`)
  }
}
