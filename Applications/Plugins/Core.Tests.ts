import "jasmine"
import IJsonObject from "../../IJsonObject"
import IMailbox from "../../Actors/IMailbox"
import IErrorHandler from "../../Actors/IErrorHandler"
import { MultiMessageHandler } from "../../Actors/IMultiMessageHandler"
import IActor from "../../Actors/IActor"
import ILogMessages from "../../Logging/ILogMessages"
import IPluginMessages from "./IPluginMessages"
import IPlugin from "./IPlugin"
import Core from "./Core"
import IApplication from "../IApplication"
import IStatelessSet from "../../State/IStatelessSet"
import ICoreMessages from "./ICoreMessages"
import IStateContainer from "../../State/IStateContainer"

interface IState extends IJsonObject {
  readonly stateContent: string
}

interface IEvent extends IJsonObject {
  readonly eventContent: string
}

interface IDerivedApplication extends IApplication<IState, IEvent> {
  readonly differentiatedBy: `this`
}

let core: Core<IState, IEvent, IDerivedApplication>
let pluginsInstances: number
let pluginsPush: jasmine.Spy
let pluginsForEach: jasmine.Spy
let stateInstances: number
let stateInstance: IStateContainer<IState>
let stateInitial: IState
let stateGet: jasmine.Spy
let stateSet: jasmine.Spy
let pluginActorInstances: number
let pluginActorInstance: IActor<IPluginMessages<IState, IEvent, IDerivedApplication>>
let pluginActorMailbox: {
  new(): IMailbox<IPluginMessages<IState, IEvent, IDerivedApplication>>
}
let pluginActorMultiMessageHandler: MultiMessageHandler<
  IPluginMessages<IState, IEvent, IDerivedApplication>
>
let pluginActorErrorHandler: IErrorHandler
let pluginActorTell: jasmine.Spy
let loggerActorInstances: number
let loggerActorInstance: IActor<ILogMessages>
let loggerActorMailbox: { new(): IMailbox<ILogMessages> }
let loggerActorMultiMessageHandler: MultiMessageHandler<ILogMessages>
let loggerActorErrorHandler: IErrorHandler
let loggerActorTell: jasmine.Spy
let errorHandler: jasmine.Spy
let application: IDerivedApplication
let applicationInitial: jasmine.Spy
let applicationApply: jasmine.Spy
let loggerVerbose: jasmine.Spy
let loggerInformation: jasmine.Spy
let loggerWarning: jasmine.Spy
let loggerError: jasmine.Spy
let logger: MultiMessageHandler<ILogMessages>
beforeEach(() => {
  pluginsInstances = 0
  pluginsPush = jasmine.createSpy()
  pluginsForEach = jasmine.createSpy()
  class PluginsStatelessSet implements IStatelessSet<IActor<IPluginMessages<
    IState,
    IEvent,
    IDerivedApplication
  >>> {
    constructor() {
      pluginsInstances++
    }

    readonly push = pluginsPush
    readonly forEach = pluginsForEach
  }

  stateInstances = 0
  stateGet = jasmine.createSpy()
  stateSet = jasmine.createSpy()
  class StateContainer implements IStateContainer<IState> {
    constructor(initial: IState) {
      stateInstances++
      stateInstance = this
      stateInitial = initial
    }

    readonly get = stateGet
    readonly set = stateSet
  }

  pluginActorInstances = 0
  pluginActorTell = jasmine.createSpy()
  class PluginActor implements IActor<IPluginMessages<
    IState,
    IEvent,
    IDerivedApplication
  >> {
    constructor(
      Mailbox: {
        new(): IMailbox<IPluginMessages<IState, IEvent, IDerivedApplication>>
      },
      multiMessageHandler: MultiMessageHandler<
        IPluginMessages<IState, IEvent, IDerivedApplication>
      >,
      errorHandler: IErrorHandler
    ) {
      pluginActorInstances++
      pluginActorInstance = this
      pluginActorMailbox = Mailbox
      pluginActorMultiMessageHandler = multiMessageHandler
      pluginActorErrorHandler = errorHandler
    }

    readonly tell = pluginActorTell
  }

  loggerActorInstances = 0
  loggerActorTell = jasmine.createSpy()
  class LoggerActor implements IActor<ILogMessages> {
    constructor(
      Mailbox: { new(): IMailbox<ILogMessages> },
      multiMessageHandler: MultiMessageHandler<ILogMessages>,
      errorHandler: IErrorHandler
    ) {
      loggerActorInstances++
      loggerActorInstance = this
      loggerActorMailbox = Mailbox
      loggerActorMultiMessageHandler = multiMessageHandler
      loggerActorErrorHandler = errorHandler
    }

    readonly tell = loggerActorTell
  }

  errorHandler = jasmine.createSpy()

  applicationInitial = jasmine.createSpy()
  applicationInitial.and.returnValue({
    stateContent: `Test Initial State Content`
  })
  applicationApply = jasmine.createSpy()
  application = {
    title: `Test Application Title`,
    initial: applicationInitial,
    apply: applicationApply,
    differentiatedBy: `this`
  }

  loggerVerbose = jasmine.createSpy()
  loggerInformation = jasmine.createSpy()
  loggerWarning = jasmine.createSpy()
  loggerError = jasmine.createSpy()
  logger = {
    verbose: loggerVerbose,
    information: loggerInformation,
    warning: loggerWarning,
    error: loggerError
  }

  core = new Core(
    PluginsStatelessSet,
    StateContainer,
    PluginActor,
    LoggerActor,
    errorHandler,
    application,
    logger
  )
})

it(
  `creates one stateless set of plugins`,
  () => expect(pluginsInstances).toEqual(1)
)
it(
  `does not push to the stateless set of plugins`,
  () => expect(pluginsPush).not.toHaveBeenCalled()
)
it(
  `does not iterate over the stateless set of plugins`,
  () => expect(pluginsForEach).not.toHaveBeenCalled()
)
it(`creates one state container`, () => expect(stateInstances).toEqual(1))
it(
  `creates the state container with the application's initial state`,
  () => expect(stateInitial).toEqual({
    stateContent: `Test Initial State Content`
  })
)
it(`does not get the state`, () => expect(stateGet).not.toHaveBeenCalled())
it(`does not set the state`, () => expect(stateSet).not.toHaveBeenCalled())
it(`does not create any plugin actors`, () => expect(pluginActorInstances).toEqual(0))
it(`creates one logger actor`, () => expect(loggerActorInstances).toEqual(1))
it(
  `creates the logger actor with an array as the mailbox`,
  () => expect(loggerActorMailbox).toBe(Array)
)
it(
  `creates the logger actor with the plugin's message handler`,
  () => expect(loggerActorMultiMessageHandler).toBe(logger)
)
it(
  `creates the logger actor with the error handler`,
  () => expect(loggerActorErrorHandler).toBe(errorHandler)
)
it(
  `does not tell the created logger actor`,
  () => expect(loggerActorTell).not.toHaveBeenCalled()
)
it(
  `does not handle any errors`,
  () => expect(errorHandler).not.toHaveBeenCalled()
)
it(
  `gets the initial state of the application`,
  () => expect(applicationInitial).toHaveBeenCalledTimes(1)
)
it(
  `does not apply any events`,
  () => expect(applicationApply).not.toHaveBeenCalled()
)
it(
  `does not directly invoke the logger's "verbose" message handler`,
  () => expect(loggerVerbose).not.toHaveBeenCalled()
)
it(
  `does not directly invoke the logger's "information" message handler`,
  () => expect(loggerInformation).not.toHaveBeenCalled()
)
it(
  `does not directly invoke the logger's "warning" message handler`,
  () => expect(loggerWarning).not.toHaveBeenCalled()
)
it(
  `does not directly invoke the logger's "verbose" message handler`,
  () => expect(loggerError).not.toHaveBeenCalled()
)

describe(`install`, () => {
  let receivedByTell: jasmine.Spy
  let receivedBy: IActor<ICoreMessages<IState, IEvent, IDerivedApplication>>
  let pluginInstalled: jasmine.Spy
  let pluginStateChanged: jasmine.Spy
  let plugin: IPlugin<IState, IEvent, IDerivedApplication>
  beforeEach(() => {
    receivedByTell = jasmine.createSpy()
    receivedBy = {
      tell: receivedByTell
    }

    pluginInstalled = jasmine.createSpy()
    pluginStateChanged = jasmine.createSpy()
    plugin = {
      installed: pluginInstalled,
      stateChanged: pluginStateChanged,
      name: `Test Plugin Name`
    }

    core.install(receivedBy, {
      plugin
    })
  })

  it(
    `does not create further stateless sets of plugins`,
    () => expect(pluginsInstances).toEqual(1)
  )
  it(
    `pushes one item to the stateless set of plugins`,
    () => expect(pluginsPush).toHaveBeenCalledTimes(1)
  )
  it(
    `pushes the created plugin actor to the stateless set of plugins`,
    () => expect(pluginsPush.calls.argsFor(0)[0]).toBe(pluginActorInstance)
  )
  it(
    `does not iterate over the stateless set of plugins`,
    () => expect(pluginsForEach).not.toHaveBeenCalled()
  )
  it(
    `does not create further state containers`,
    () => expect(stateInstances).toEqual(1)
  )
  it(`does not get the state`, () => expect(stateGet).not.toHaveBeenCalled())
  it(`does not set the state`, () => expect(stateSet).not.toHaveBeenCalled())
  it(`creates one plugin actor`, () => expect(pluginActorInstances).toEqual(1))
  it(
    `creates the plugin actor with an array as the mailbox`,
    () => expect(pluginActorMailbox).toBe(Array)
  )
  it(
    `creates the plugin actor with the plugin's message handler`,
    () => expect(pluginActorMultiMessageHandler).toBe(plugin)
  )
  it(
    `creates the plugin actor with the error handler`,
    () => expect(pluginActorErrorHandler).toBe(errorHandler)
  )
  it(
    `tells the created plugin actor once`,
    () => expect(pluginActorTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the created plugin actor it has been installed`,
    () => expect(pluginActorTell).toHaveBeenCalledWith(`installed`, {
      core: receivedBy,
      application: application,
      state: stateInstance,
      logger: loggerActorInstance
    })
  )
  it(
    `does not create further logger actors`,
    () => expect(loggerActorInstances).toEqual(1)
  )
  it(
    `tells the logger actor once`,
    () => expect(loggerActorTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the logger actor to log that a plugin has been installed`,
    () => expect(loggerActorTell).toHaveBeenCalledWith(`information`, {
      instigator: `Core`,
      message: `Plugin "Test Plugin Name" has been installed.`
    })
  )
  it(
    `does not handle any errors`,
    () => expect(errorHandler).not.toHaveBeenCalled()
  )
  it(
    `does not get the initial state of the application again`,
    () => expect(applicationInitial).toHaveBeenCalledTimes(1)
  )
  it(
    `does not apply any events`,
    () => expect(applicationApply).not.toHaveBeenCalled()
  )
  it(
    `does not tell itself`,
    () => expect(receivedByTell).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the plugin's "installed" message handler`,
    () => expect(pluginInstalled).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the plugin's "stateChanged" message handler`,
    () => expect(pluginStateChanged).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "verbose" message handler`,
    () => expect(loggerVerbose).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "information" message handler`,
    () => expect(loggerInformation).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "warning" message handler`,
    () => expect(loggerWarning).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "verbose" message handler`,
    () => expect(loggerError).not.toHaveBeenCalled()
  )
})

describe(`replaceState`, () => {
  let receivedByTell: jasmine.Spy
  let receivedBy: IActor<ICoreMessages<IState, IEvent, IDerivedApplication>>
  beforeEach(() => {
    receivedByTell = jasmine.createSpy()
    receivedBy = {
      tell: receivedByTell
    }

    core.replaceState(receivedBy, {
      state: {
        stateContent: `Test Replacing State Content`
      }
    })
  })

  it(
    `does not create further stateless sets of plugins`,
    () => expect(pluginsInstances).toEqual(1)
  )
  it(
    `does not push to the stateless set of plugins`,
    () => expect(pluginsPush).not.toHaveBeenCalled()
  )
  it(
    `iterates over the stateless set of plugins once`,
    () => expect(pluginsForEach).toHaveBeenCalledTimes(1)
  )
  it(
    `does not create further state containers`,
    () => expect(stateInstances).toEqual(1)
  )
  it(`does not get the state`, () => expect(stateGet).not.toHaveBeenCalled())
  it(`sets the state once`, () => expect(stateSet).toHaveBeenCalledTimes(1))
  it(
    `sets the state to the replacing state`,
    () => expect(stateSet).toHaveBeenCalledWith({
      stateContent: `Test Replacing State Content`
    })
  )
  it(
    `set the state before iterating over the plugins`,
    () => expect(stateSet).toHaveBeenCalledBefore(pluginsForEach)
  )
  it(
    `does not create any plugin actors`,
    () => expect(pluginActorInstances).toEqual(0)
  )
  it(
    `does not create further logger actors`,
    () => expect(loggerActorInstances).toEqual(1)
  )
  it(
    `tells the logger actor once`,
    () => expect(loggerActorTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the logger actor to log that a state has been replaced`,
    () => expect(loggerActorTell).toHaveBeenCalledWith(`information`, {
      instigator: `Core`,
      message: `Application state has been replaced.`
    })
  )
  it(
    `does not handle any errors`,
    () => expect(errorHandler).not.toHaveBeenCalled()
  )
  it(
    `does not get the initial state of the application again`,
    () => expect(applicationInitial).toHaveBeenCalledTimes(1)
  )
  it(
    `does not apply any events`,
    () => expect(applicationApply).not.toHaveBeenCalled()
  )
  it(
    `does not tell itself`,
    () => expect(receivedByTell).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "verbose" message handler`,
    () => expect(loggerVerbose).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "information" message handler`,
    () => expect(loggerInformation).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "warning" message handler`,
    () => expect(loggerWarning).not.toHaveBeenCalled()
  )
  it(
    `does not directly invoke the logger's "verbose" message handler`,
    () => expect(loggerError).not.toHaveBeenCalled()
  )

  describe(`the callback given to the stateless set of plugins`, () => {
    let pluginTell: jasmine.Spy
    beforeEach(() => {
      receivedByTell = jasmine.createSpy()
      receivedBy = {
        tell: receivedByTell
      }

      pluginTell = jasmine.createSpy()

      pluginsForEach.calls.argsFor(0)[0]({
        tell: pluginTell
      })
    })

    it(
      `does not create further stateless sets of plugins`,
      () => expect(pluginsInstances).toEqual(1)
    )
    it(
      `does not push to the stateless set of plugins`,
      () => expect(pluginsPush).not.toHaveBeenCalled()
    )
    it(
      `does not iterate over the stateless set of plugins again`,
      () => expect(pluginsForEach).toHaveBeenCalledTimes(1)
    )
    it(
      `does not create further state containers`,
      () => expect(stateInstances).toEqual(1)
    )
    it(`does not get the state`, () => expect(stateGet).not.toHaveBeenCalled())
    it(
      `does not set the state again`,
      () => expect(stateSet).toHaveBeenCalledTimes(1)
    )
    it(
      `does not create any plugin actors`,
      () => expect(pluginActorInstances).toEqual(0)
    )
    it(
      `does not create further logger actors`,
      () => expect(loggerActorInstances).toEqual(1)
    )
    it(
      `does not tell the logger actor again`,
      () => expect(loggerActorTell).toHaveBeenCalledTimes(1)
    )
    it(
      `does not handle any errors`,
      () => expect(errorHandler).not.toHaveBeenCalled()
    )
    it(
      `does not get the initial state of the application again`,
      () => expect(applicationInitial).toHaveBeenCalledTimes(1)
    )
    it(
      `does not apply any events`,
      () => expect(applicationApply).not.toHaveBeenCalled()
    )
    it(
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
    it(
      `tells the plugin once`,
      () => expect(pluginTell).toHaveBeenCalledTimes(1)
    )
    it(
      `tells the plugin that state changed`,
      () => expect(pluginTell).toHaveBeenCalledWith(`stateChanged`, {
        event: null
      })
    )
    it(
      `does not directly invoke the logger's "verbose" message handler`,
      () => expect(loggerVerbose).not.toHaveBeenCalled()
    )
    it(
      `does not directly invoke the logger's "information" message handler`,
      () => expect(loggerInformation).not.toHaveBeenCalled()
    )
    it(
      `does not directly invoke the logger's "warning" message handler`,
      () => expect(loggerWarning).not.toHaveBeenCalled()
    )
    it(
      `does not directly invoke the logger's "verbose" message handler`,
      () => expect(loggerError).not.toHaveBeenCalled()
    )
  })
})
