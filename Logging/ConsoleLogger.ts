import IEventHandler from "../Actors/IEventHandler"
import * as ILogEvent from "./ILogEvent"

/**
 * Logs to the JavaScript console.
 */
export default class ConsoleLogger implements IEventHandler<ILogEvent.default> {
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
  async handle(event: ILogEvent.default): Promise<void> {
    switch (event.level) {
      case ILogEvent.Level.Verbose:
        this.console.log(
          `Verbose@${new this.Date().toISOString()}: ${event.message}`
        )
        break
      case ILogEvent.Level.Information:
        this.console.info(
          `Information@${new this.Date().toISOString()}: ${event.message}`
        )
        break
      case ILogEvent.Level.Warning:
        this.console.warn(
          `Warning@${new this.Date().toISOString()}: ${event.message}`
        )
        break
      case ILogEvent.Level.Error:
        this.console.error(
          `Error@${new this.Date().toISOString()}: ${event.message}`
        )
        break
    }
  }
}
