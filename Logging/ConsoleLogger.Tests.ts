import "jasmine"
import IActor from "../Actors/IActor"
import ILogMessages from "./ILogMessages"
import ConsoleLogger from "./ConsoleLogger"

let logger: ConsoleLogger
beforeEach(() => logger = new ConsoleLogger())

describe(`imports`, () => {
  it(`Date`, () => expect(logger.Date).toBe(Date))
  it(`console`, () => expect(logger.console).toBe(console))
})

describe(`on calling`, () => {
  let createdDates: number
  let consoleLog: jasmine.Spy
  let consoleInfo: jasmine.Spy
  let consoleWarn: jasmine.Spy
  let consoleError: jasmine.Spy
  let receivedBy: IActor<ILogMessages>
  let receivedByTell: jasmine.Spy
  beforeEach(() => {
    createdDates = 0
    logger.Date = class MockData {
      constructor() {
        createdDates++
      }

      toISOString() {
        return `Test Iso String`
      }
    }
    consoleLog = jasmine.createSpy()
    consoleInfo = jasmine.createSpy()
    consoleWarn = jasmine.createSpy()
    consoleError = jasmine.createSpy()
    logger.console = {
      log: consoleLog,
      info: consoleInfo,
      warn: consoleWarn,
      error: consoleError
    }
    receivedByTell = jasmine.createSpy()
    receivedBy = {
      tell: receivedByTell
    }
  })
  describe(`verbose`, () => {
    beforeEach(async () => await logger.verbose(receivedBy, {
      message: `Test Message`
    }))
    it(`creates one Date`, () => expect(createdDates).toEqual(1))
    it(
      `calls console.log once`,
      () => expect(consoleLog).toHaveBeenCalledTimes(1)
    )
    it(
      `calls console.log with the built message`,
      () => expect(consoleLog)
        .toHaveBeenCalledWith(`Verbose@Test Iso String: Test Message`)
    )
    it(
      `does not call console.info`,
      () => expect(consoleInfo).not.toHaveBeenCalled()
    )
    it(
      `does not call console.warn`,
      () => expect(consoleWarn).not.toHaveBeenCalled()
    )
    it(
      `does not call console.error`,
      () => expect(consoleError).not.toHaveBeenCalled()
    )
    it(
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
  })
  describe(`information`, () => {
    beforeEach(async () => await logger.information(receivedBy, {
      message: `Test Message`
    }))
    it(`creates one Date`, () => expect(createdDates).toEqual(1))
    it(
      `does not call console.log`,
      () => expect(consoleLog).not.toHaveBeenCalled()
    )
    it(
      `calls console.info once`,
      () => expect(consoleInfo).toHaveBeenCalledTimes(1)
    )
    it(
      `calls console.info with the built message`,
      () => expect(consoleInfo)
        .toHaveBeenCalledWith(`Information@Test Iso String: Test Message`)
    )
    it(
      `does not call console.warn`,
      () => expect(consoleWarn).not.toHaveBeenCalled()
    )
    it(
      `does not call console.error`,
      () => expect(consoleError).not.toHaveBeenCalled()
    )
    it(
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
  })
  describe(`warning`, () => {
    beforeEach(async () => await logger.warning(receivedBy, {
      message: `Test Message`
    }))
    it(`creates one Date`, () => expect(createdDates).toEqual(1))
    it(
      `does not call console.log`,
      () => expect(consoleLog).not.toHaveBeenCalled()
    )
    it(
      `does not call console.info`,
      () => expect(consoleInfo).not.toHaveBeenCalled()
    )
    it(
      `calls console.warn once`,
      () => expect(consoleWarn).toHaveBeenCalledTimes(1)
    )
    it(
      `calls console.warn with the built message`,
      () => expect(consoleWarn)
        .toHaveBeenCalledWith(`Warning@Test Iso String: Test Message`)
    )
    it(
      `does not call console.error`,
      () => expect(consoleError).not.toHaveBeenCalled()
    )
    it(
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
  })
  describe(`error`, () => {
    beforeEach(async () => await logger.error(receivedBy, {
      message: `Test Message`
    }))
    it(`creates one Date`, () => expect(createdDates).toEqual(1))
    it(
      `does not call console.log`,
      () => expect(consoleLog).not.toHaveBeenCalled()
    )
    it(
      `does not call console.info`,
      () => expect(consoleInfo).not.toHaveBeenCalled()
    )
    it(
      `does not call console.warn`,
      () => expect(consoleWarn).not.toHaveBeenCalled()
    )
    it(
      `calls console.error once`,
      () => expect(consoleError).toHaveBeenCalledTimes(1)
    )
    it(
      `calls console.error with the built message`,
      () => expect(consoleError)
        .toHaveBeenCalledWith(`Error@Test Iso String: Test Message`)
    )
    it(
      `does not tell itself`,
      () => expect(receivedByTell).not.toHaveBeenCalled()
    )
  })
})
