import { MultiEventHandler } from "../Actors/IMultiEventHandler"
import ILogEvent from "./ILogEvent"

/**
 * Logs to the JavaScript console.
 */
export default class ConsoleLogger implements MultiEventHandler<ILogEvent> {
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
  async verbose(event: {
    readonly message: string
  }): Promise<void> {
    this.console.log(
      `Verbose@${new this.Date().toISOString()}: ${event.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async information(event: {
    readonly message: string
  }): Promise<void> {
    this.console.info(
      `Information@${new this.Date().toISOString()}: ${event.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async warning(event: {
    readonly message: string
  }): Promise<void> {
    this.console.warn(
      `Warning@${new this.Date().toISOString()}: ${event.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async error(event: {
    readonly message: string
  }): Promise<void> {
    this.console.error(
      `Error@${new this.Date().toISOString()}: ${event.message}`
    )
  }
}
