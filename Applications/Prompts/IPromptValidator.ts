import IJsonObject from "../../IJsonObject"

/**
 * Validates user input when compared to the control they have been shown.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPromptValidator<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > {
  /**
   * Validates that a back button could have been pressed.  Assumes that the
   * hash matches.
   * @param sessionId The session ID of the user which pressed the back button.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  back(sessionId: string):
    | {
      /**
       * Indicates that there was not a back button to press.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }

  /**
   * Validates that a text field could have been entered.  Assumes that the
   * hash matches.
   * @param text The text which has been entered.
   * @param sessionId The session ID of the user which entered text.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  text(text: string, sessionId: string):
    | {
      /**
       * Indicates that there was not a text control to answer.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that the text given was too short to fit within the control's
       * minimum limit.
       */
      readonly type: `tooShort`
    }
    | {
      /**
       * Indicates that the text given was too long to fit within the control's
       * upper limit.
       */
      readonly type: `tooLong`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }

  /**
   * Validates that a password field could have been entered.  Assumes that the
   * hash matches.
   * @param password The password which has been entered.
   * @param sessionId The session ID of the user which entered a password.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  password(password: string, sessionId: string):
    | {
      /**
       * Indicates that there was not a password control to answer.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that the password given was too short to fit within the
       * control's lower bound.
       */
      readonly type: `tooShort`
    }
    | {
      /**
       * Indicates that the password given was too long to fit within the
       * control's upper bound.
       */
      readonly type: `tooLong`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }

  /**
   * Validates that a number field could have been entered.  Assumes that the
   * hash matches.
   * @param number The number which has been entered.
   * @param sessionId The session ID of the user which entered a number.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  number(number: number, sessionId: string):
    | {
      /**
       * Indicates that there was not a number control to answer.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that the number given was less than the control's lower
       * bound.
       */
      readonly type: `lessThanMinimum`
    }
    | {
      /**
       * Indicates that the number given was greater than the control's upper
       * bound.
       */
      readonly type: `greaterThanMaximum`
    }
    | {
      /**
       * Indicates that the number given does not match the control's step.
       */
      readonly type: `invalidStep`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }

  /**
   * Validates that a multiple choice option could have been selected.  Assumes
   * that the hash matches.
   * @param label The label of the option which has been selected.
   * @param sessionId The session ID of the user which selected an option.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  multipleChoiceByLabel(label: string, sessionId: string):
    | {
      /**
       * Indicates that there was not a multiple choice control to answer.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that the label given was not in the list of options.
       */
      readonly type: `invalidLabel`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }

  /**
   * Validates that a multiple choice option could have been selected.  Assumes
   * that the hash matches.
   * @param label The index of the option which has been selected.
   * @param sessionId The session ID of the user which selected an option.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  multipleChoiceByIndex(index: number, sessionId: string):
    | {
      /**
       * Indicates that there was not a multiple choice control to answer.
       */
      readonly type: `invalidControl`
    }
    | {
      /**
       * Indicates that the index given did not fit in the list of options.
       */
      readonly type: `indexOutOfRange`
    }
    | {
      /**
       * Indicates that validation was successful.
       */
      readonly type: `success`

      /**
       * The event which should be applied.
       */
      readonly event: TEvent
    }
}
