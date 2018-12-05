import IJsonObject from "../../IJsonObject"
import IPrompt from "./IPrompt"

/**
 * Validates user input when compared to the control they have been shown.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPromptValidator<
  TEvent extends IJsonObject
  > {
  /**
   * Validates that a back button could have been pressed.  Assumes that the
   * hash matches.
   * @param prompt The prompt on which the back button is to have been pressed.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  back(prompt: IPrompt<TEvent>):
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
   * @param prompt The prompt on which text is to have been entered.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  text(text: string, prompt: IPrompt<TEvent>):
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
   * @param prompt The prompt on which a password is to have been entered.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  password(password: string, prompt: IPrompt<TEvent>):
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
   * @param prompt The prompt on which a number is to have been entered.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  number(number: number, prompt: IPrompt<TEvent>):
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
   * @param prompt The prompt on which a multiple choice selection is to have
   * been made.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  multipleChoiceByLabel(label: string, prompt: IPrompt<TEvent>):
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
   * @param prompt The prompt on which a multiple choice selection is to have
   * been made.
   * @returns The event which should be applied, or a reason why one could not
   * be produced.
   */
  multipleChoiceByIndex(index: number, prompt: IPrompt<TEvent>):
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
