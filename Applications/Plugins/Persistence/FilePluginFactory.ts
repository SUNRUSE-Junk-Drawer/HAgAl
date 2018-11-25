import * as fs from "fs"
import * as path from "path"
import * as util from "util"
const mkdirp = require(`mkdirp`)
import IJsonObject from "../../../IJsonObject"
import IActor from "../../../Actors/IActor"
import IApplication from "../../IApplication"
import ILogEvent from "../../../Logging/ILogEvent"
import IPluginFactory from "../IPluginFactory"
import IPluginHandler from "../IPluginHandler"
import IPluginCreated from "../IPluginCreated"

/**
 * Persists the latest state to a single file.
 * @template TState The JSON-serializable type of application state.
 * @template TEvent The JSON-serializable type of changes to application state.
 * @template TApplication The application type interfaced with.
 */
export default class FilePluginFactory<
  TState extends IJsonObject,
  TEvent extends IJsonObject,
  TApplication extends IApplication<TState, TEvent>
  > implements IPluginFactory<TState, TEvent, TApplication> {
  private readonly filename: string

  /**
   * @param filename The path to the file to persist to.
   */
  constructor(filename: string) {
    this.filename = filename
  }

  /**
   * Enables dependency injection in tests.
   */
  fsReadFile: (
    path: string,
    options: { encoding: string },
    callback: (err: NodeJS.ErrnoException, data: string) => void
  ) => void = fs.readFile

  /**
   * Enables dependency injection in tests.
   */
  pathDirname = path.dirname

  /**
   * Enables dependency injection in tests.
   */
  mkdirp = mkdirp

  /**
   * Enables dependency injection in tests.
   */
  fsWriteFile: (
    path: string,
    data: string,
    callback: (err: NodeJS.ErrnoException) => void
  ) => void = fs.writeFile

  /**
   * Enables dependency injection in tests.
   */
  fsRename: (
    oldPath: string,
    newPath: string,
    callback: (err: NodeJS.ErrnoException) => void
  ) => void = fs.rename

  /**
  * @inheritdoc
  */
  readonly name = `file`

  /**
   * @inheritdoc
   */
  async createInstance(
    application: TApplication,
    logger: IActor<ILogEvent>,
    state: TState,
    pluginHandler: IPluginHandler<TState, TEvent>
  ): Promise<IPluginCreated<TState, TEvent>> {
    const mkdirp = util.promisify(this.mkdirp)
    const fsReadFile = util.promisify(this.fsReadFile)
    const fsWriteFile = util.promisify(this.fsWriteFile)
    const fsRename = util.promisify(this.fsRename)
    let data: string = ``
    try {
      data = await fsReadFile(this.filename, { encoding: `utf8` })
    } catch (e) {
      if (e.code != `ENOENT`) {
        throw e
      } else {
        const directory = this.pathDirname(this.filename)
        logger.tell({
          key: `verbose`,
          value: {
            message: `"${this.filename}" does not exist; `
              + `ensuring that directory "${directory}" exists...`
          }
        })
        await mkdirp(directory)
      }
    }
    if (data) {
      logger.tell({
        key: `verbose`,
        value: {
          message: `"${this.filename}" exists; restoring state...`
        }
      })
      state = JSON.parse(data)
    }
    const tempFileName = `${this.filename}.tmp`
    const finalFilename = this.filename
    return {
      state,
      instance: {
        async stateChanged(state: TState, event: TEvent): Promise<void> {
          await fsWriteFile(tempFileName, JSON.stringify(state))
          await fsRename(tempFileName, finalFilename)
        },
        async dispose(): Promise<void> {

        }
      }
    }
  }
}
