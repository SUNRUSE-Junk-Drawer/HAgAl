import * as util from "util"
import IJsonObject from "../../../IJsonObject"
import IStateContainer from "../../../State/IStateContainer"
import ILoggerProxy from "../../../Logging/ILoggerProxy"
import IActor from "../../../Actors/IActor"
import IApplication from "../../IApplication"
import IPluginMessages from "../IPluginMessages"
import ICoreMessages from "../ICoreMessages"
import IPlugin from "../IPlugin"

/**
 * Persists the latest state to a single file.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type interfaced with.
 */
export default class FilePlugin<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  > implements IPlugin<TState, TEvent, TApplication> {
  private readonly fsReadFile: (
    path: string,
    options: { encoding: string }
  ) => Promise<string>
  private readonly mkdirp: (
    p: string
  ) => Promise<void>
  private readonly fsWriteFile: (
    path: string,
    data: string
  ) => Promise<void>
  private readonly fsRename: (
    oldPath: string,
    newPath: string
  ) => Promise<void>
  private readonly tempFilename: string

  /**
   * @param fsReadFile Enables dependency injection in tests.
   * @param pathDirname Enables dependency injection in tests.
   * @param mkdirp Enables dependency injection in tests.
   * @param fsWriteFile Enables dependency injection in tests.
   * @param fsRename Enables dependency injection in tests.
   * @param filename The path to the file to persist to.
   */
  constructor(
    fsReadFile: (
      path: string,
      options: { encoding: string },
      callback: (err: NodeJS.ErrnoException, data: string) => void
    ) => void,
    private readonly pathDirname: (p: string) => string,
    mkdirp: (
      p: string,
      cb: (err: Error | null) => void
    ) => void,
    fsWriteFile: (
      path: string,
      data: string,
      callback: (err: NodeJS.ErrnoException) => void
    ) => void,
    fsRename: (
      oldPath: string,
      newPath: string,
      callback: (err: NodeJS.ErrnoException) => void
    ) => void,
    private readonly filename: string
  ) {
    this.fsReadFile = util.promisify(fsReadFile)
    this.mkdirp = util.promisify(mkdirp)
    this.fsWriteFile = util.promisify(fsWriteFile)
    this.fsRename = util.promisify(fsRename)
    this.tempFilename = `${filename}.tmp`
  }

  /**
  * @inheritdoc
  */
  readonly name = `File`

  /**
  * @inheritdoc
  */
  async installed(
    receivedBy: IActor<IPluginMessages<TState, TEvent, TApplication>>,
    message: {
      readonly core: IActor<ICoreMessages<TState, TEvent, TApplication>>
      readonly application: TApplication
      readonly state: IStateContainer<TState>
      readonly logger: ILoggerProxy
    }
  ): Promise<void> {
    let data: string = ``
    try {
      data = await this.fsReadFile(this.filename, { encoding: `utf8` })
    } catch (e) {
      if (e.code != `ENOENT`) {
        throw e
      } else {
        const directory = this.pathDirname(this.filename)
        message.logger.tell(`verbose`, `"${this.filename}" does not exist; `
          + `ensuring that directory "${directory}" exists...`
        )
        await this.mkdirp(directory)
      }
    }
    if (data) {
      message.logger.tell(
        `verbose`, `"${this.filename}" exists; restoring state...`
      )
      message.core.tell(`replaceState`, {
        state: JSON.parse(data)
      })
    }
  }

  /**
  * @inheritdoc
  */
  async stateChanged(
    receivedBy: IActor<IPluginMessages<TState, TEvent, TApplication>>,
    message: {
      readonly state: TState
      readonly event: null | TEvent
    }
  ): Promise<void> {
    await this.fsWriteFile(this.tempFilename, JSON.stringify(message.state))
    await this.fsRename(this.tempFilename, this.filename)
  }
}
