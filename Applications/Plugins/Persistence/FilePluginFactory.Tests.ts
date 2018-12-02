import "jasmine"
import * as fs from "fs"
import * as path from "path"
const mkdirp = require(`mkdirp`)
import IJsonObject from "../../../IJsonObject"
import IActor from "../../../Actors/IActor"
import FilePluginFactory from "./FilePluginFactory"
import IApplication from "../../IApplication"
import ILogMessages from "../../../Logging/ILogMessages"
import IPluginHandler from "../IPluginHandler"
import IPluginCreated from "../IPluginCreated"

interface IState extends IJsonObject {
  readonly stateContent: string
}

interface IEvent extends IJsonObject {
  readonly eventContent: string
}

interface ICustomApplication extends IApplication<IState, IEvent> { }

let factory: FilePluginFactory<IState, IEvent, ICustomApplication>
beforeEach(
  () => factory = new FilePluginFactory<IState, IEvent, ICustomApplication>(
    `Test Filename`
  )
)

describe(`imports`, () => {
  it(`fs.readFile`, () => expect(factory.fsReadFile).toBe(fs.readFile))
  it(`path.dirname`, () => expect(factory.pathDirname).toBe(path.dirname))
  it(`mkdirp`, () => expect(factory.mkdirp).toBe(mkdirp))
  it(`fs.writeFile`, () => expect(factory.fsWriteFile).toBe(fs.writeFile))
  it(`fs.rename`, () => expect(factory.fsRename).toBe(fs.rename))
})

it(
  `has a name of "file"`,
  () => expect(new FilePluginFactory<IState, IEvent, ICustomApplication>(
    `Test Filename`
  ).name)
    .toEqual(`file`)
)

describe(`createInstance`, () => {
  let fsReadFile: jasmine.Spy
  let pathDirname: jasmine.Spy
  let mkdirp: jasmine.Spy
  let fsWriteFile: jasmine.Spy
  let fsRename: jasmine.Spy
  let applicationInitial: jasmine.Spy
  let applicationApply: jasmine.Spy
  let application: IApplication<IState, IEvent>
  let loggerTell: jasmine.Spy
  let logger: IActor<ILogMessages>
  let initialState: IState
  let pluginHandlerState: jasmine.Spy
  let pluginHandlerTell: jasmine.Spy
  let pluginHandler: IPluginHandler<IState, IEvent>
  let pluginCreated: IPluginCreated<IState, IEvent>
  beforeEach(() => {
    fsReadFile = jasmine.createSpy()
    factory.fsReadFile = fsReadFile
    pathDirname = jasmine.createSpy()
    factory.pathDirname = pathDirname
    mkdirp = jasmine.createSpy()
    factory.mkdirp = mkdirp
    fsWriteFile = jasmine.createSpy()
    factory.fsWriteFile = fsWriteFile
    fsRename = jasmine.createSpy()
    factory.fsRename = fsRename
    applicationInitial = jasmine.createSpy()
    applicationApply = jasmine.createSpy()
    application = {
      title: `Test Title`,
      initial: applicationInitial,
      apply: applicationApply
    }
    loggerTell = jasmine.createSpy()
    logger = {
      tell: loggerTell
    }
    initialState = { stateContent: `Test Initial State Content` }
    pluginHandlerState = jasmine.createSpy()
    pluginHandlerTell = jasmine.createSpy()
    pluginHandler = {
      state: pluginHandlerState,
      tell: pluginHandlerTell
    }
  })

  class DummyError extends Error implements NodeJS.ErrnoException {
    readonly errno = undefined
    readonly code: string
    readonly path = undefined
    readonly syscall = undefined

    constructor(code: string) {
      super()
      this.code = code
    }
  }

  describe(`when the file exists`, () => {
    let deserializedState: IState
    beforeEach(async () => {
      deserializedState = { stateContent: `Test Deserialized State Content` }

      fsReadFile.and.callFake((
        path: string,
        options: { encoding: string },
        callback: (err: NodeJS.ErrnoException | null, data: string | null) => void
      ) => callback(null, JSON.stringify(deserializedState)))

      pluginCreated = await factory.createInstance(
        application, logger, initialState, pluginHandler
      )
    })
    it(
      `calls fs.readFile once`,
      () => expect(fsReadFile).toHaveBeenCalledTimes(1)
    )
    it(
      `calls fs.readFile with the filename`,
      () => expect(fsReadFile).toHaveBeenCalledWith(
        `Test Filename`, jasmine.anything(), jasmine.anything()
      )
    )
    it(
      `calls fs.readFile with a utf-8 encoding`,
      () => expect(fsReadFile).toHaveBeenCalledWith(
        jasmine.anything(), { encoding: `utf8` }, jasmine.anything()
      )
    )
    it(
      `does not call path.dirname`,
      () => expect(pathDirname).not.toHaveBeenCalled()
    )
    it(
      `does not call mkdirp`,
      () => expect(mkdirp).not.toHaveBeenCalled()
    )
    it(
      `does not call fs.writeFile`,
      () => expect(fsWriteFile).not.toHaveBeenCalled()
    )
    it(
      `does not call fs.rename`,
      () => expect(fsRename).not.toHaveBeenCalled()
    )
    it(
      `does not call application.initial`,
      () => expect(applicationInitial).not.toHaveBeenCalled()
    )
    it(
      `does not call application.apply`,
      () => expect(applicationApply).not.toHaveBeenCalled()
    )
    it(
      `logs once`,
      () => expect(loggerTell).toHaveBeenCalledTimes(1)
    )
    it(
      `logs to indicate that state is being restored`,
      () => expect(loggerTell).toHaveBeenCalledWith(`verbose`, {
        instigator: `File`,
        message: `"Test Filename" exists; restoring state...`
      })
    )
    it(
      `does not call pluginHandler.state`,
      () => expect(pluginHandlerState).not.toHaveBeenCalled()
    )
    it(
      `does not call pluginHandler.tell`,
      () => expect(pluginHandlerTell).not.toHaveBeenCalled()
    )
    it(
      `returns the deserialized file as state`,
      () => expect(pluginCreated.state).toEqual(deserializedState)
    )
    xdescribe(`stateChanged`, () => { })
    xdescribe(`dispose`, () => { })
  })

  describe(`when the file does not exist`, () => {
    beforeEach(() => {
      pathDirname.and.returnValue(`Test Filename Dirname`)

      fsReadFile.and.callFake((
        path: string,
        options: { encoding: string },
        callback: (err: NodeJS.ErrnoException | null, data: string | null) => void
      ) => callback(new DummyError(`ENOENT`), null))
    })
    describe(`when the directory can be created`, () => {
      beforeEach(async () => {
        mkdirp.and.callFake((
          p: string,
          cb: (err: any, made: string | null) => void
        ) => cb(null, p))

        pluginCreated = await factory.createInstance(
          application, logger, initialState, pluginHandler
        )
      })
      it(
        `calls fs.readFile once`,
        () => expect(fsReadFile).toHaveBeenCalledTimes(1)
      )
      it(
        `calls fs.readFile with the filename`,
        () => expect(fsReadFile).toHaveBeenCalledWith(
          `Test Filename`, jasmine.anything(), jasmine.anything()
        )
      )
      it(
        `calls fs.readFile with a utf-8 encoding`,
        () => expect(fsReadFile).toHaveBeenCalledWith(
          jasmine.anything(), { encoding: `utf8` }, jasmine.anything()
        )
      )
      it(
        `calls path.dirname once`,
        () => expect(pathDirname).toHaveBeenCalledTimes(1)
      )
      it(
        `calls path.dirname with the filename`,
        () => expect(pathDirname).toHaveBeenCalledWith(`Test Filename`)
      )
      it(
        `calls mkdirp once`,
        () => expect(mkdirp).toHaveBeenCalledTimes(1)
      )
      it(
        `calls mkdirp with the dirname of the filename`,
        () => expect(mkdirp)
          .toHaveBeenCalledWith(`Test Filename Dirname`, jasmine.anything())
      )
      it(
        `does not call fs.writeFile`,
        () => expect(fsWriteFile).not.toHaveBeenCalled()
      )
      it(
        `does not call fs.rename`,
        () => expect(fsRename).not.toHaveBeenCalled()
      )
      it(
        `does not call application.initial`,
        () => expect(applicationInitial).not.toHaveBeenCalled()
      )
      it(
        `does not call application.apply`,
        () => expect(applicationApply).not.toHaveBeenCalled()
      )
      it(
        `logs once`,
        () => expect(loggerTell).toHaveBeenCalledTimes(1)
      )
      it(
        `logs to indicate that state is being restored`,
        () => expect(loggerTell).toHaveBeenCalledWith(`verbose`, {
          instigator: `File`,
          message: `"Test Filename" does not exist; ensuring that directory `
            + `"Test Filename Dirname" exists...`
        })
      )
      it(
        `does not call pluginHandler.state`,
        () => expect(pluginHandlerState).not.toHaveBeenCalled()
      )
      it(
        `does not call pluginHandler.tell`,
        () => expect(pluginHandlerTell).not.toHaveBeenCalled()
      )
      it(
        `returns the deserialized file as state`,
        () => expect(pluginCreated.state).toEqual(initialState)
      )
      describe(`then`, () => {
        beforeEach(() => {
          fsReadFile.calls.reset()
          pathDirname.calls.reset()
          mkdirp.calls.reset()
          loggerTell.calls.reset()
        })
        describe(`stateChanged`, () => {
          let stateToWrite: IState
          let eventToWrite: IEvent
          beforeEach(async () => {
            stateToWrite = { stateContent: `Test Written State` }
            eventToWrite = { eventContent: `Test Written Event` }
          })
          describe(`when writing the temporary file fails`, () => {
            let error: NodeJS.ErrnoException
            let thrown: any
            beforeEach(async () => {
              error = new DummyError(`UNEXPECTED`)
              fsWriteFile.and.callFake((
                path: string,
                data: string,
                callback: (err: NodeJS.ErrnoException | null) => void
              ): void => callback(error))

              thrown = null
              try {
                await pluginCreated.instance.stateChanged(
                  stateToWrite, eventToWrite
                )
              } catch (e) {
                thrown = e
              }
            })
            it(
              `does not call fs.readFile`,
              () => expect(fsReadFile).not.toHaveBeenCalled()
            )
            it(
              `does not call path.dirname`,
              () => expect(pathDirname).not.toHaveBeenCalled()
            )
            it(
              `does not call mkdirp`,
              () => expect(mkdirp).not.toHaveBeenCalled()
            )
            it(
              `calls fs.writeFile once`,
              () => expect(fsWriteFile).toHaveBeenCalledTimes(1)
            )
            it(
              `calls fs.writeFile with the filename (with .tmp appended)`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                `Test Filename.tmp`, jasmine.anything(), jasmine.anything()
              )
            )
            it(
              `calls fs.writeFile with the serialized state`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                jasmine.anything(),
                JSON.stringify(stateToWrite),
                jasmine.anything()
              )
            )
            it(
              `does not call fs.rename`,
              () => expect(fsRename).not.toHaveBeenCalled()
            )
            it(
              `does not call application.initial`,
              () => expect(applicationInitial).not.toHaveBeenCalled()
            )
            it(
              `does not call application.apply`,
              () => expect(applicationApply).not.toHaveBeenCalled()
            )
            it(
              `does not log`,
              () => expect(loggerTell).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.state`,
              () => expect(pluginHandlerState).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.tell`,
              () => expect(pluginHandlerTell).not.toHaveBeenCalled()
            )
            it(
              `returns the deserialized file as state`,
              () => expect(pluginCreated.state).toEqual(initialState)
            )
            it(
              `throws the error raised by fs.writeFile`,
              () => expect(thrown).toBe(error)
            )
          })
          describe(`when renaming the temporary file fails`, () => {
            let error: NodeJS.ErrnoException
            let thrown: any
            beforeEach(async () => {
              error = new DummyError(`UNEXPECTED`)
              fsWriteFile.and.callFake((
                path: string,
                data: string,
                callback: (err: NodeJS.ErrnoException | null) => void
              ): void => callback(null))
              fsRename.and.callFake((
                oldPath: string,
                newPath: string,
                callback: (err: NodeJS.ErrnoException) => void
              ): void => callback(error))

              thrown = null
              try {
                await pluginCreated.instance.stateChanged(
                  stateToWrite, eventToWrite
                )
              } catch (e) {
                thrown = e
              }
            })
            it(
              `does not call fs.readFile`,
              () => expect(fsReadFile).not.toHaveBeenCalled()
            )
            it(
              `does not call path.dirname`,
              () => expect(pathDirname).not.toHaveBeenCalled()
            )
            it(
              `does not call mkdirp`,
              () => expect(mkdirp).not.toHaveBeenCalled()
            )
            it(
              `calls fs.writeFile once`,
              () => expect(fsWriteFile).toHaveBeenCalledTimes(1)
            )
            it(
              `calls fs.writeFile with the filename (with .tmp appended)`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                `Test Filename.tmp`, jasmine.anything(), jasmine.anything()
              )
            )
            it(
              `calls fs.writeFile with the serialized state`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                jasmine.anything(),
                JSON.stringify(stateToWrite),
                jasmine.anything()
              )
            )
            it(
              `calls fs.rename once`,
              () => expect(fsRename).toHaveBeenCalledTimes(1)
            )
            it(
              `calls fs.rename with the temporary file name`,
              () => expect(fsRename).toHaveBeenCalledWith(
                `Test Filename.tmp`, jasmine.anything(), jasmine.anything()
              )
            )
            it(
              `calls fs.rename with the final file name`,
              () => expect(fsRename).toHaveBeenCalledWith(
                jasmine.anything(), `Test Filename`, jasmine.anything()
              )
            )
            it(
              `does not call application.initial`,
              () => expect(applicationInitial).not.toHaveBeenCalled()
            )
            it(
              `does not call application.apply`,
              () => expect(applicationApply).not.toHaveBeenCalled()
            )
            it(
              `does not log`,
              () => expect(loggerTell).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.state`,
              () => expect(pluginHandlerState).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.tell`,
              () => expect(pluginHandlerTell).not.toHaveBeenCalled()
            )
            it(
              `returns the deserialized file as state`,
              () => expect(pluginCreated.state).toEqual(initialState)
            )
            it(
              `throws the error raised by fs.rename`,
              () => expect(thrown).toBe(error)
            )
          })
          describe(`when successful`, () => {
            beforeEach(async () => {
              fsWriteFile.and.callFake((
                path: string,
                data: string,
                callback: (err: NodeJS.ErrnoException | null) => void
              ): void => callback(null))
              fsRename.and.callFake((
                oldPath: string,
                newPath: string,
                callback: (err: NodeJS.ErrnoException | null) => void
              ): void => callback(null))
              await pluginCreated.instance.stateChanged(
                stateToWrite, eventToWrite
              )
            })
            it(
              `does not call fs.readFile`,
              () => expect(fsReadFile).not.toHaveBeenCalled()
            )
            it(
              `does not call path.dirname`,
              () => expect(pathDirname).not.toHaveBeenCalled()
            )
            it(
              `does not call mkdirp`,
              () => expect(mkdirp).not.toHaveBeenCalled()
            )
            it(
              `calls fs.writeFile once`,
              () => expect(fsWriteFile).toHaveBeenCalledTimes(1)
            )
            it(
              `calls fs.writeFile with the filename (with .tmp appended)`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                `Test Filename.tmp`, jasmine.anything(), jasmine.anything()
              )
            )
            it(
              `calls fs.writeFile with the serialized state`,
              () => expect(fsWriteFile).toHaveBeenCalledWith(
                jasmine.anything(),
                JSON.stringify(stateToWrite),
                jasmine.anything()
              )
            )
            it(
              `calls fs.rename once`,
              () => expect(fsRename).toHaveBeenCalledTimes(1)
            )
            it(
              `calls fs.rename with the temporary file name`,
              () => expect(fsRename).toHaveBeenCalledWith(
                `Test Filename.tmp`, jasmine.anything(), jasmine.anything()
              )
            )
            it(
              `calls fs.rename with the final file name`,
              () => expect(fsRename).toHaveBeenCalledWith(
                jasmine.anything(), `Test Filename`, jasmine.anything()
              )
            )
            it(
              `does not call application.initial`,
              () => expect(applicationInitial).not.toHaveBeenCalled()
            )
            it(
              `does not call application.apply`,
              () => expect(applicationApply).not.toHaveBeenCalled()
            )
            it(
              `does not log`,
              () => expect(loggerTell).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.state`,
              () => expect(pluginHandlerState).not.toHaveBeenCalled()
            )
            it(
              `does not call pluginHandler.tell`,
              () => expect(pluginHandlerTell).not.toHaveBeenCalled()
            )
            it(
              `returns the deserialized file as state`,
              () => expect(pluginCreated.state).toEqual(initialState)
            )
          })
        })
        describe(`dispose`, () => {
          beforeEach(async () => {
            await pluginCreated.instance.dispose()
          })
          it(
            `does not call fs.readFile`,
            () => expect(fsReadFile).not.toHaveBeenCalled()
          )
          it(
            `does not call path.dirname`,
            () => expect(pathDirname).not.toHaveBeenCalled()
          )
          it(
            `does not call mkdirp`,
            () => expect(mkdirp).not.toHaveBeenCalled()
          )
          it(
            `does not call fs.writeFile`,
            () => expect(fsWriteFile).not.toHaveBeenCalled()
          )
          it(
            `does not call fs.rename`,
            () => expect(fsRename).not.toHaveBeenCalled()
          )
          it(
            `does not call application.initial`,
            () => expect(applicationInitial).not.toHaveBeenCalled()
          )
          it(
            `does not call application.apply`,
            () => expect(applicationApply).not.toHaveBeenCalled()
          )
          it(
            `does not log`,
            () => expect(loggerTell).not.toHaveBeenCalled()
          )
          it(
            `does not call pluginHandler.state`,
            () => expect(pluginHandlerState).not.toHaveBeenCalled()
          )
          it(
            `does not call pluginHandler.tell`,
            () => expect(pluginHandlerTell).not.toHaveBeenCalled()
          )
          it(
            `returns the deserialized file as state`,
            () => expect(pluginCreated.state).toEqual(initialState)
          )
        })
      })
    })

    describe(`when the directory cannot be created`, () => {
      let thrown: any
      beforeEach(async () => {
        mkdirp.and.callFake((
          p: string,
          cb: (err: any, made: string | null) => void
        ) => cb(`Test Error`, null))

        thrown = null
        try {
          pluginCreated = await factory.createInstance(
            application, logger, initialState, pluginHandler
          )
        } catch (e) {
          thrown = e
        }
      })
      it(
        `calls fs.readFile once`,
        () => expect(fsReadFile).toHaveBeenCalledTimes(1)
      )
      it(
        `calls fs.readFile with the filename`,
        () => expect(fsReadFile).toHaveBeenCalledWith(
          `Test Filename`, jasmine.anything(), jasmine.anything()
        )
      )
      it(
        `calls fs.readFile with a utf-8 encoding`,
        () => expect(fsReadFile).toHaveBeenCalledWith(
          jasmine.anything(), { encoding: `utf8` }, jasmine.anything()
        )
      )
      it(
        `calls path.dirname once`,
        () => expect(pathDirname).toHaveBeenCalledTimes(1)
      )
      it(
        `calls path.dirname with the filename`,
        () => expect(pathDirname).toHaveBeenCalledWith(`Test Filename`)
      )
      it(
        `calls mkdirp once`,
        () => expect(mkdirp).toHaveBeenCalledTimes(1)
      )
      it(
        `calls mkdirp with the dirname of the filename`,
        () => expect(mkdirp)
          .toHaveBeenCalledWith(`Test Filename Dirname`, jasmine.anything())
      )
      it(
        `does not call fs.writeFile`,
        () => expect(fsWriteFile).not.toHaveBeenCalled()
      )
      it(
        `does not call fs.rename`,
        () => expect(fsRename).not.toHaveBeenCalled()
      )
      it(
        `does not call application.initial`,
        () => expect(applicationInitial).not.toHaveBeenCalled()
      )
      it(
        `does not call application.apply`,
        () => expect(applicationApply).not.toHaveBeenCalled()
      )
      it(
        `logs once`,
        () => expect(loggerTell).toHaveBeenCalledTimes(1)
      )
      it(
        `logs to indicate that state is being restored`,
        () => expect(loggerTell).toHaveBeenCalledWith(`verbose`, {
          instigator: `File`,
          message: `"Test Filename" does not exist; ensuring that directory `
            + `"Test Filename Dirname" exists...`
        })
      )
      it(
        `does not call pluginHandler.state`,
        () => expect(pluginHandlerState).not.toHaveBeenCalled()
      )
      it(
        `does not call pluginHandler.tell`,
        () => expect(pluginHandlerTell).not.toHaveBeenCalled()
      )
      it(
        `throws the error raised by mkdirp`,
        () => expect(thrown).toEqual(`Test Error`)
      )
    })
  })

  describe(`when the file cannot be read`, () => {
    let error: NodeJS.ErrnoException
    let thrown: any
    beforeEach(async () => {
      pathDirname.and.returnValue(`Test Filename Dirname`)

      error = new DummyError(`UNEXPECTED`)

      fsReadFile.and.callFake((
        path: string,
        options: { encoding: string },
        callback: (err: NodeJS.ErrnoException | null, data: string | null) => void
      ) => callback(error, null))

      thrown = null
      try {
        pluginCreated = await factory.createInstance(
          application, logger, initialState, pluginHandler
        )
      } catch (e) {
        thrown = e
      }
    })
    it(
      `calls fs.readFile once`,
      () => expect(fsReadFile).toHaveBeenCalledTimes(1)
    )
    it(
      `calls fs.readFile with the filename`,
      () => expect(fsReadFile).toHaveBeenCalledWith(
        `Test Filename`, jasmine.anything(), jasmine.anything()
      )
    )
    it(
      `calls fs.readFile with a utf-8 encoding`,
      () => expect(fsReadFile).toHaveBeenCalledWith(
        jasmine.anything(), { encoding: `utf8` }, jasmine.anything()
      )
    )
    it(
      `deos not call path.dirname`,
      () => expect(pathDirname).not.toHaveBeenCalled()
    )
    it(
      `does not call mkdirp`,
      () => expect(mkdirp).not.toHaveBeenCalled()
    )
    it(
      `does not call fs.writeFile`,
      () => expect(fsWriteFile).not.toHaveBeenCalled()
    )
    it(
      `does not call fs.rename`,
      () => expect(fsRename).not.toHaveBeenCalled()
    )
    it(
      `does not call application.initial`,
      () => expect(applicationInitial).not.toHaveBeenCalled()
    )
    it(
      `does not call application.apply`,
      () => expect(applicationApply).not.toHaveBeenCalled()
    )
    it(
      `does not log`,
      () => expect(loggerTell).not.toHaveBeenCalled()
    )
    it(
      `does not call pluginHandler.state`,
      () => expect(pluginHandlerState).not.toHaveBeenCalled()
    )
    it(
      `does not call pluginHandler.tell`,
      () => expect(pluginHandlerTell).not.toHaveBeenCalled()
    )
    it(
      `throws the error raised by fs.readFile`,
      () => expect(thrown).toBe(error)
    )
  })
})
