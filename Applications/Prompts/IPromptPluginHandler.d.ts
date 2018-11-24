import IJsonObject from "../../IJsonObject"
import IActor from "../../Actors/IActor"
import ITextEntered from "./ITextEntered"
import IPasswordEntered from "./IPasswordEntered"
import INumberEntered from "./INumberEntered"
import IMultipleChoiceSelected from "./IMultipleChoiceSelected"
import IBackPressed from "./IBackPressed"
import IPluginHandler from "../Plugins/IPluginHandler";
import IPrompt from "./IPrompt";

/**
 * The interface between the core and a plugin which can accept prompts.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 */
export default interface IPromptPluginHandler<
  TState extends IJsonObject,
  TEvent extends IJsonObject
  > extends IActor<
  | ITextEntered
  | IPasswordEntered
  | INumberEntered
  | IMultipleChoiceSelected
  | IBackPressed
  > {
  render(sessionId: string): IPrompt<TEvent>
}
