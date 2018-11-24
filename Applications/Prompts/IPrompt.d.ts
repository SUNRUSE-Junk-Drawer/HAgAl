import IJsonObject from "../../IJsonObject"
import SingleKeyValueOf from "../../SingleKeyValueOf"

/**
 * Describes the types of controls which can be present on a prompt.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
interface IControl<TEvent extends IJsonObject> {
  /**
   * A free-text user control is to be shown.
   * White space will be trimmed and normalized to single spaces.
   */
  text: {
    /**
     * The minimum length of the text after normalization.
     */
    readonly minimumLength: number

    /**
     * The maximum length of the text after normalization.
     */
    readonly maximumLength: number

    /**
     * Called when the text is entered.
     * @param text The entered text.
     * @returns The event to apply to the application state.
     */
    onEntry(text: string): TEvent
  }

  /**
   * A free-text user control is to be shown, formatted for passwords.
   */
  password: {
    /**
     * The minimum length of the password.
     */
    readonly minimumLength: number

    /**
     * The maximum length of the password.
     */
    readonly maximumLength: number

    /**
     * Called when the password is entered.
     * @param password The entered password.
     * @returns The event to apply to the application state.
     */
    onEntry(password: string): TEvent
  }

  /**
   * A numeric input is to be shown.
   */
  number: {
    /**
     * The minimum accepatable value (inclusive).
     */
    readonly minimum: number

    /**
     * The maximum acceptable value (inclusive).
     */
    readonly maximum: number

    /**
     * The step between acceptable values (0.25 would allow .., -0.5, 0.25, 0,
     * 0.25, 0.5, ...)
     */
    readonly step: number

    /**
     * Called when the number is entered.
     * @param number The entered number.
     * @returns The event to apply to the application state.
     */
    onEntry(number: number): TEvent
  }

  /**
   * A multiple-choice menu is to be shown.
   */
  multipleChoice: {
    /**
     * The choices to show.
     */
    readonly options: ReadonlyArray<{
      /**
       * The label shown on the option.
       */
      readonly label: string

      /**
       * Called when the option is selected.
       * @returns The event to apply to the application state.
       */
      onSelection(): TEvent
    }>
  }
}

/**
 * Describes a prompt to be shown to a user.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPrompt<TEvent extends IJsonObject> {
  /** A label for the prompt.  Should be short. */
  readonly label: string

  /** A description of what is currently happening.  Can be long. */
  readonly description: string

  /** The control to show to the user, if any, else, null. */
  readonly control: SingleKeyValueOf<IControl<TEvent>> | null

  /**
   * Called when the back button is pressed; no back button is to be shown when
   * null.
   * @returns The event to apply to the application state.
   */
  readonly onBack: (() => TEvent) | null
}
