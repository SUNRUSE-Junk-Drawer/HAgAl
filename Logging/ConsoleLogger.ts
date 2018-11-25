import { MultiMessageHandler } from "../Actors/IMultiMessageHandler"
import ILogMessages from "./ILogMessages"

/**
 * Logs to the JavaScript console.
 */
export default class ConsoleLogger implements MultiMessageHandler<ILogMessages> {
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
  async verbose(message: {
    readonly message: string
  }): Promise<void> {
    this.console.log(
      `Verbose@${new this.Date().toISOString()}: ${message.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async information(message: {
    readonly message: string
  }): Promise<void> {
    this.console.info(
      `Information@${new this.Date().toISOString()}: ${message.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async warning(message: {
    readonly message: string
  }): Promise<void> {
    this.console.warn(
      `Warning@${new this.Date().toISOString()}: ${message.message}`
    )
  }

  /**
   * @inheritdoc
   */
  async error(message: {
    readonly message: string
  }): Promise<void> {
    this.console.error(
      `Error@${new this.Date().toISOString()}: ${message.message}`
    )
  }
}
