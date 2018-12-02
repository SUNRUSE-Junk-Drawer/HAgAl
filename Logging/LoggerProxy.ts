import IActor from "../Actors/IActor"
import ILogMessages from "./ILogMessages"
import ILoggerProxy from "./ILoggerProxy"

/**
 * @inheritdoc
 */
export default class LoggerProxy implements ILoggerProxy {
  constructor(
    private readonly logger: IActor<ILogMessages>,
    private readonly name: string
  ) { }

  /**
   * @inheritdoc
   */
  verbose(message: string): void {
    this.logger.tell({
      key: `verbose`,
      value: {
        instigator: this.name,
        message
      }
    })
  }

  /**
   * @inheritdoc
   */
  information(message: string): void {
    this.logger.tell({
      key: `information`,
      value: {
        instigator: this.name,
        message
      }
    })
  }

  /**
   * @inheritdoc
   */
  warning(message: string): void {
    this.logger.tell({
      key: `warning`,
      value: {
        instigator: this.name,
        message
      }
    })
  }

  /**
   * @inheritdoc
   */
  error(message: string): void {
    this.logger.tell({
      key: `error`,
      value: {
        instigator: this.name,
        message
      }
    })
  }
}
