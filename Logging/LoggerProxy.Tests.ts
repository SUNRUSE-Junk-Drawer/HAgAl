import "jasmine"
import IActor from "../Actors/IActor"
import ILogMessages from "./ILogMessages"
import LoggerProxy from "./LoggerProxy"

let logger: IActor<ILogMessages>
let loggerTell: jasmine.Spy
let loggerProxy: LoggerProxy
beforeEach(() => {
  loggerTell = jasmine.createSpy()
  logger = {
    tell: loggerTell
  }

  loggerProxy = new LoggerProxy(logger, `Test Name`)
})

it(
  `does not tell any messages to the proxied logger`,
  () => expect(loggerTell).not.toHaveBeenCalled()
)

describe(`verbose`, () => {
  beforeEach(() => loggerProxy.tell(`verbose`, `Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a verbose message`,
    () => expect(loggerTell).toHaveBeenCalledWith(`verbose`, {
      instigator: `Test Name`,
      message: `Test Message`
    })
  )
})

describe(`information`, () => {
  beforeEach(() => loggerProxy.tell(`information`, `Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a information message`,
    () => expect(loggerTell).toHaveBeenCalledWith(`information`, {
      instigator: `Test Name`,
      message: `Test Message`
    })
  )
})

describe(`warning`, () => {
  beforeEach(() => loggerProxy.tell(`warning`, `Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a warning message`,
    () => expect(loggerTell).toHaveBeenCalledWith(`warning`, {
      instigator: `Test Name`,
      message: `Test Message`
    })
  )
})

describe(`error`, () => {
  beforeEach(() => loggerProxy.tell(`error`, `Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a error message`,
    () => expect(loggerTell).toHaveBeenCalledWith(`error`, {
      instigator: `Test Name`,
      message: `Test Message`
    })
  )
})
