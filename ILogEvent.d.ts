import IJsonObject from "./IJsonObject"

/**
 * The importance/purpose of a log event.
 */
export const enum Level {
  /**
   * Deemed unimportant.  Likely safe to drop.
   */
  Verbose,

  /**
   * Indicates that an important event occurred.
   */
  Information,

  /**
   * May (but does not necessarily) indicate an error.
   */
  Warning,

  /**
   * Indicates that a serious error has occured.
   */
  Error
}

/**
 * Specifies that a message should be logged.
 */
export default interface ILogEvent extends IJsonObject {
  /**
   * The importance/purpose of the message.
   */
  readonly level: Level

  /**
   * The text of the message.
   */
  readonly message: string
}
