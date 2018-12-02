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
  tell(key: keyof ILogMessages, message: string): void {
    this.logger.tell(key, {
      instigator: this.name,
      message
    })
  }
}
