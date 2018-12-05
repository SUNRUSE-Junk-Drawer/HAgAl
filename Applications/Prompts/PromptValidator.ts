import IJsonObject from "../../IJsonObject"
import IPrompt from "./IPrompt"
import IPromptValidator from "./IPromptValidator"

/**
 * @inheritdoc
 */
export default class PromptValidator<
  TEvent extends IJsonObject
  > implements IPromptValidator<TEvent> {
  /**
   * @inheritdoc
   */
  back(prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.onBack) {
      return { type: `invalidControl` }
    }

    return {
      type: `success`,
      event: prompt.onBack()
    }
  }

  /**
   * @inheritdoc
   */
  text(text: string, prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | { readonly type: `tooShort` }
    | { readonly type: `tooLong` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.control || prompt.control.key != `text`) {
      return { type: `invalidControl` }
    }

    text = text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ` `)

    if (text.length < prompt.control.value.minimumLength) {
      return { type: `tooShort` }
    }

    if (text.length > prompt.control.value.maximumLength) {
      return { type: `tooLong` }
    }

    return {
      type: `success`,
      event: prompt.control.value.onEntry(text)
    }
  }

  /**
   * @inheritdoc
   */
  password(password: string, prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | { readonly type: `tooShort` }
    | { readonly type: `tooLong` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.control || prompt.control.key != `password`) {
      return { type: `invalidControl` }
    }

    password = password.trim()

    if (password.length < prompt.control.value.minimumLength) {
      return { type: `tooShort` }
    }

    if (password.length > prompt.control.value.maximumLength) {
      return { type: `tooLong` }
    }

    return {
      type: `success`,
      event: prompt.control.value.onEntry(password)
    }
  }

  /**
   * @inheritdoc
   */
  number(number: number, prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | { readonly type: `lessThanMinimum` }
    | { readonly type: `greaterThanMaximum` }
    | { readonly type: `invalidStep` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.control || prompt.control.key != `number`) {
      return { type: `invalidControl` }
    }

    if (number < prompt.control.value.minimum) {
      return { type: `lessThanMinimum` }
    }

    if (number > prompt.control.value.maximum) {
      return { type: `greaterThanMaximum` }
    }

    const rounded = number % prompt.control.value.step
    const tolerance = 0.00001
    if (rounded > tolerance && rounded < prompt.control.value.step - tolerance) {
      return { type: `invalidStep` }
    }

    return {
      type: `success`,
      event: prompt.control.value.onEntry(number)
    }
  }

  /**
   * @inheritdoc
   */
  multipleChoiceByLabel(label: string, prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | { readonly type: `invalidLabel` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.control || prompt.control.key != `multipleChoice`) {
      return { type: `invalidControl` }
    }

    for (const option of prompt.control.value.options) {
      if (option.label == label) {
        return {
          type: `success`,
          event: option.onSelection()
        }
      }
    }

    return { type: `invalidLabel` }
  }

  /**
   * @inheritdoc
   */
  multipleChoiceByIndex(index: number, prompt: IPrompt<TEvent>):
    | { readonly type: `invalidControl` }
    | { readonly type: `indexOutOfRange` }
    | {
      readonly type: `success`
      readonly event: TEvent
    } {

    if (!prompt.control || prompt.control.key != `multipleChoice`) {
      return { type: `invalidControl` }
    }

    if (index >= prompt.control.value.options.length) {
      return { type: `indexOutOfRange` }
    }

    return {
      type: `success`,
      event: prompt.control.value.options[index].onSelection()
    }
  }
}
