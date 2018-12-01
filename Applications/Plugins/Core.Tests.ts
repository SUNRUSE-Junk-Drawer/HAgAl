import "jasmine"
import IJsonObject from "../../IJsonObject"
import IMailbox from "../../Actors/IMailbox"
import IErrorHandler from "../../Actors/IErrorHandler"
import { MultiMessageHandler } from "../../Actors/IMultiMessageHandler"
import IActor from "../../Actors/IActor"
import IPluginMessages from "./IPluginMessages"
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
let actorInstances: number
let actorInstance: IActor<IPluginMessages<IState, IEvent, IDerivedApplication>>
let actorMailbox: {
  new(): IMailbox<IPluginMessages<IState, IEvent, IDerivedApplication>>
}
let actorMultiMessageHandler: MultiMessageHandler<
  IPluginMessages<IState, IEvent, IDerivedApplication>
>
let actorErrorHandler: IErrorHandler
let actorTell: jasmine.Spy
let errorHandler: jasmine.Spy
let application: IDerivedApplication
let applicationInitial: jasmine.Spy
let applicationApply: jasmine.Spy
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

  actorInstances = 0
  actorTell = jasmine.createSpy()
  class Actor implements IActor<IPluginMessages<
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
      actorInstances++
      actorInstance = this
      actorMailbox = Mailbox
      actorMultiMessageHandler = multiMessageHandler
      actorErrorHandler = errorHandler
    }

    readonly tell = actorTell
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

  core = new Core(
    PluginsStatelessSet,
    StateContainer,
    Actor,
    errorHandler,
    application
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
it(`does not create any actors`, () => expect(actorInstances).toEqual(0))
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

describe(`install`, () => {
  let receivedByTell: jasmine.Spy
  let receivedBy: IActor<ICoreMessages<IState, IEvent, IDerivedApplication>>
  let pluginInstalled: jasmine.Spy
  let pluginStateChanged: jasmine.Spy
  let plugin: MultiMessageHandler<IPluginMessages<IState, IEvent, IDerivedApplication>>
  beforeEach(() => {
    receivedByTell = jasmine.createSpy()
    receivedBy = {
      tell: receivedByTell
    }

    pluginInstalled = jasmine.createSpy()
    pluginStateChanged = jasmine.createSpy()
    plugin = {
      installed: pluginInstalled,
      stateChanged: pluginStateChanged
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
    `pushes the created actor to the stateless set of plugins`,
    () => expect(pluginsPush.calls.argsFor(0)[0]).toBe(actorInstance)
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
  it(`creates one actor`, () => expect(actorInstances).toEqual(1))
  it(
    `creates the actor with an array as the mailbox`,
    () => expect(actorMailbox).toBe(Array)
  )
  it(
    `creates the actor with the plugin's message handler`,
    () => expect(actorMultiMessageHandler).toBe(plugin)
  )
  it(
    `creates the actor with the error handler`,
    () => expect(actorErrorHandler).toBe(errorHandler)
  )
  it(
    `tells the created actor once`,
    () => expect(actorTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the created actor it has been installed`,
    () => expect(actorTell).toHaveBeenCalledWith({
      key: `installed`,
      value: {
        core: receivedBy,
        application: application,
        state: stateInstance
      }
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
  it(`does not create any actors`, () => expect(actorInstances).toEqual(0))
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
    it(`does not create any actors`, () => expect(actorInstances).toEqual(0))
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
      () => expect(pluginTell).toHaveBeenCalledWith({
        key: `stateChanged`,
        value: {
          event: null
        }
      })
    )
  })
})
