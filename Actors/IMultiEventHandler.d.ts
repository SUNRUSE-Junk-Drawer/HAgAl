import IEventHandler from "./IEventHandler"

/**
 * Defines how an actor handles a set of events.
 * @template TEvents The types of events.
 */
export type MultiEventHandler<TEvents> = {
  /**
   * A handler for an event type.
   */
  readonly [key in keyof TEvents]: IEventHandler<TEvents[key]>
}
