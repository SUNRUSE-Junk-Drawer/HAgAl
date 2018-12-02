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
  beforeEach(() => loggerProxy.verbose(`Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a verbose message`,
    () => expect(loggerTell).toHaveBeenCalledWith({
      key: `verbose`,
      value: {
        instigator: `Test Name`,
        message: `Test Message`
      }
    })
  )
})

describe(`information`, () => {
  beforeEach(() => loggerProxy.information(`Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a information message`,
    () => expect(loggerTell).toHaveBeenCalledWith({
      key: `information`,
      value: {
        instigator: `Test Name`,
        message: `Test Message`
      }
    })
  )
})

describe(`warning`, () => {
  beforeEach(() => loggerProxy.warning(`Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a warning message`,
    () => expect(loggerTell).toHaveBeenCalledWith({
      key: `warning`,
      value: {
        instigator: `Test Name`,
        message: `Test Message`
      }
    })
  )
})

describe(`error`, () => {
  beforeEach(() => loggerProxy.error(`Test Message`))
  it(
    `tells one message to the proxied logger`,
    () => expect(loggerTell).toHaveBeenCalledTimes(1)
  )
  it(
    `tells the proxied logger to log a error message`,
    () => expect(loggerTell).toHaveBeenCalledWith({
      key: `error`,
      value: {
        instigator: `Test Name`,
        message: `Test Message`
      }
    })
  )
})
