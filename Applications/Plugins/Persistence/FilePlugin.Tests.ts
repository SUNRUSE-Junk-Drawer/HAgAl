import "jasmine"
import IJsonObject from "../../../IJsonObject"
import IReadOnlyStateContainer from "../../../State/IReadOnlyStateContainer"
import IActor from "../../../Actors/IActor"
import ILoggerProxy from "../../../Logging/ILoggerProxy"
import FilePlugin from "./FilePlugin"
import IApplication from "../../IApplication"
import ICoreMessages from "../ICoreMessages"
import IPluginMessages from "../IPluginMessages"

interface IState extends IJsonObject {
  readonly stateContent: string
}

interface IEvent extends IJsonObject {
  readonly eventContent: string
}

interface ICustomApplication extends IApplication<IState, IEvent> { }

let fsReadFile: jasmine.Spy
let pathDirname: jasmine.Spy
let mkdirp: jasmine.Spy
let fsWriteFile: jasmine.Spy
let fsRename: jasmine.Spy
let filePlugin: FilePlugin<IState, IEvent, ICustomApplication>
beforeEach(() => {
  fsReadFile = jasmine.createSpy()
  pathDirname = jasmine.createSpy()
  mkdirp = jasmine.createSpy()
  fsWriteFile = jasmine.createSpy()
  fsRename = jasmine.createSpy()
  filePlugin = new FilePlugin<IState, IEvent, ICustomApplication>(
    fsReadFile,
    pathDirname,
    mkdirp,
    fsWriteFile,
    fsRename,
    `Test Filename`
  )
})

it(`has a name of "File"`, () => expect(filePlugin.name).toEqual(`File`))
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
  `does not call fsWriteFile`,
  () => expect(fsWriteFile).not.toHaveBeenCalled()
)
it(
  `does not call fs.rename`,
  () => expect(fsRename).not.toHaveBeenCalled()
)

describe(`install`, () => {
  let receivedByTell: jasmine.Spy
  let receivedBy: IActor<IPluginMessages<IState, IEvent, ICustomApplication>>
  let coreTell: jasmine.Spy
  let applicationInitial: jasmine.Spy
  let applicationApply: jasmine.Spy
  let applicationHash: jasmine.Spy
  let stateGet: jasmine.Spy
  let loggerTell: jasmine.Spy
  let installed: {
    readonly core: IActor<ICoreMessages<IState, IEvent, ICustomApplication>>
    readonly application: ICustomApplication
    readonly state: IReadOnlyStateContainer<IState>
    readonly logger: ILoggerProxy
  }
  beforeEach(() => {
    receivedByTell = jasmine.createSpy()
    coreTell = jasmine.createSpy()
    applicationInitial = jasmine.createSpy()
    applicationApply = jasmine.createSpy()
    applicationHash = jasmine.createSpy()
    stateGet = jasmine.createSpy()
    loggerTell = jasmine.createSpy()
    installed = {
      core: {
        tell: coreTell
      },
      application: {
        title: `Test Application Title`,
        initial: applicationInitial,
        apply: applicationApply,
        hash: applicationHash
      },
      state: {
        get: stateGet
      },
      logger: {
        tell: loggerTell
      }
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

      await filePlugin.installed(receivedBy, installed)
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
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
    it(
      `tells the core once`,
      () => expect(coreTell).toHaveBeenCalledTimes(1)
    )
    it(
      `tells the core that state is to be replaced`,
      () => expect(coreTell).toHaveBeenCalledWith(`replaceState`, {
        state: deserializedState
      })
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
      `does not call application.hash`,
      () => expect(applicationHash).not.toHaveBeenCalled()
    )
    it(
      `does not call state.get`,
      () => expect(stateGet).not.toHaveBeenCalled()
    )
    it(
      `logs once`,
      () => expect(loggerTell).toHaveBeenCalledTimes(1)
    )
    it(
      `logs to indicate that state is being restored`,
      () => expect(loggerTell).toHaveBeenCalledWith(
        `verbose`,
        `"Test Filename" exists; restoring state...`
      )
    )
    Then()
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

        await filePlugin.installed(receivedBy, installed)
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
        `does not tell itself`,
        () => expect(receivedByTell).not.toHaveBeenCalled()
      )
      it(
        `does not tell the core`,
        () => expect(coreTell).not.toHaveBeenCalled()
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
        `does not call application.hash`,
        () => expect(applicationHash).not.toHaveBeenCalled()
      )
      it(
        `does not call state.get`,
        () => expect(stateGet).not.toHaveBeenCalled()
      )
      it(
        `logs once`,
        () => expect(loggerTell).toHaveBeenCalledTimes(1)
      )
      it(
        `logs to indicate that state is being restored`,
        () => expect(loggerTell).toHaveBeenCalledWith(
          `verbose`,
          `"Test Filename" does not exist; ensuring that directory `
          + `"Test Filename Dirname" exists...`
        )
      )
      Then()
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
          await filePlugin.installed(receivedBy, installed)
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
        `does not tell itself`,
        () => expect(receivedByTell).not.toHaveBeenCalled()
      )
      it(
        `does not tell the core`,
        () => expect(coreTell).not.toHaveBeenCalled()
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
        `does not call application.hash`,
        () => expect(applicationHash).not.toHaveBeenCalled()
      )
      it(
        `does not call state.get`,
        () => expect(stateGet).not.toHaveBeenCalled()
      )
      it(
        `logs once`,
        () => expect(loggerTell).toHaveBeenCalledTimes(1)
      )
      it(
        `logs to indicate that state is being restored`,
        () => expect(loggerTell).toHaveBeenCalledWith(
          `verbose`,
          `"Test Filename" does not exist; ensuring that directory `
          + `"Test Filename Dirname" exists...`
        )
      )
      it(
        `throws the error raised by mkdirp`,
        () => expect(thrown).toBe(`Test Error`)
      )
    })
  })

  function Then() {
    describe(`then`, () => {
      beforeEach(() => {
        fsReadFile.calls.reset()
        pathDirname.calls.reset()
        mkdirp.calls.reset()
        coreTell.calls.reset()
        loggerTell.calls.reset()
      })
      function StateChanged(
        description: string,
        event: null | IEvent
      ): void {
        let stateToWrite: IState
        let eventToWrite: IEvent
        beforeEach(async () => {
          stateToWrite = { stateContent: `Test Written State` }
          eventToWrite = JSON.parse(JSON.stringify(event))
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
              await filePlugin.stateChanged(receivedBy, {
                state: stateToWrite,
                event: eventToWrite
              })
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
            `does not tell itself`,
            () => expect(receivedByTell).not.toHaveBeenCalled()
          )
          it(
            `does not tell the core`,
            () => expect(coreTell).not.toHaveBeenCalled()
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
            `does not call application.hash`,
            () => expect(applicationHash).not.toHaveBeenCalled()
          )
          it(
            `does not call state.get`,
            () => expect(stateGet).not.toHaveBeenCalled()
          )
          it(
            `does not log`,
            () => expect(loggerTell).not.toHaveBeenCalled()
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
              await filePlugin.stateChanged(receivedBy, {
                state: stateToWrite,
                event: eventToWrite
              })
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
            `does not tell itself`,
            () => expect(receivedByTell).not.toHaveBeenCalled()
          )
          it(
            `does not tell the core`,
            () => expect(coreTell).not.toHaveBeenCalled()
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
            `does not call application.hash`,
            () => expect(applicationHash).not.toHaveBeenCalled()
          )
          it(
            `does not log`,
            () => expect(loggerTell).not.toHaveBeenCalled()
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
            await filePlugin.stateChanged(receivedBy, {
              state: stateToWrite,
              event: eventToWrite
            })
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
            `does not tell itself`,
            () => expect(receivedByTell).not.toHaveBeenCalled()
          )
          it(
            `does not tell the core`,
            () => expect(coreTell).not.toHaveBeenCalled()
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
            `does not call application.hash`,
            () => expect(applicationHash).not.toHaveBeenCalled()
          )
          it(
            `does not call state.get`,
            () => expect(stateGet).not.toHaveBeenCalled()
          )
          it(
            `does not log`,
            () => expect(loggerTell).not.toHaveBeenCalled()
          )
        })
      }
      StateChanged(
        `stateChanged with event`,
        { eventContent: `Test Written Event` }
      )
      StateChanged(`stateChanged without event`, null)
      describe(`stateStale`, () => {
        beforeEach(async () => await filePlugin.stateStale(receivedBy, {
          sessionId: `Test Session Id`,
          state: { stateContent: `Test Fresh State` },
          staleHash: `Test Stale Hash`,
          freshHash: `Test Fresh Hash`
        }))
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
          `does not call fs.writeFile`,
          () => expect(fsWriteFile).not.toHaveBeenCalled()
        )
        it(
          `does not call fs.rename`,
          () => expect(fsRename).not.toHaveBeenCalled()
        )
        it(
          `does not tell itself`,
          () => expect(receivedByTell).not.toHaveBeenCalled()
        )
        it(
          `does not tell the core`,
          () => expect(coreTell).not.toHaveBeenCalled()
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
          `does not call application.hash`,
          () => expect(applicationHash).not.toHaveBeenCalled()
        )
        it(
          `does not call state.get`,
          () => expect(stateGet).not.toHaveBeenCalled()
        )
        it(
          `does not log`,
          () => expect(loggerTell).not.toHaveBeenCalled()
        )
      })
    })
  }

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
        await filePlugin.installed(receivedBy, installed)
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
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
    it(
      `does not tell the core`,
      () => expect(coreTell).not.toHaveBeenCalled()
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
      `does not call application.hash`,
      () => expect(applicationHash).not.toHaveBeenCalled()
    )
    it(
      `does not call state.get`,
      () => expect(stateGet).not.toHaveBeenCalled()
    )
    it(
      `does not log`,
      () => expect(loggerTell).not.toHaveBeenCalled()
    )
    it(
      `throws the error raised by fs.readFile`,
      () => expect(thrown).toBe(error)
    )
  })
})
