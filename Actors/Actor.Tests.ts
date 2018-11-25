import "jasmine"
import * as util from "util"
import { SingleKeyValueOf } from "../ISingleKeyValueOf"
import Actor from "./Actor"
import IMailbox from "./IMailbox"
import { MultiEventHandler } from "./IMultiEventHandler"

const nextTick = util.promisify(process.nextTick)

interface IEvent {
  readonly testKeyA: boolean
  readonly testKeyB: string
  readonly testKeyC: string
  readonly testKeyD: string
  readonly testKeyE: number
}

interface IReason {
  readonly reasonContent: string
}

type EventFactory = (content: string) => SingleKeyValueOf<IEvent>

type Step = {
  readonly description: string
  readonly asynchronous: boolean
  readonly event: SingleKeyValueOf<IEvent>
  readonly eventAvailableImmediately: boolean
  readonly reason: null | IReason
  readonly eventsDuringCallback: SingleKeyValueOf<IEvent>[]
}

function GenerateStep(eventFactory: EventFactory, eventFactoriesDuringCallback: EventFactory[], suffix: string, eventAvailableImmediately: boolean): Step[] {
  const steps: Step[] = []
  for (const asynchronous of [false, true]) {
    for (const reason of [false, true]) {
      for (const eventsDuringCallback of [0, 1, 2, 3]) {
        steps.push({
          description: `${eventAvailableImmediately ? `continued by` : ``} ${reason ? `unsuccessful` : `successful`} ${asynchronous ? `asynchronous` : `synchronous`}ly handled event during which ${eventsDuringCallback} event(s) are raised`,
          asynchronous,
          event: eventFactory(`Test Event Content ${suffix}`),
          eventAvailableImmediately,
          reason: reason ? { reasonContent: `Test Reason Content ${suffix}` } : null,
          eventsDuringCallback: eventFactoriesDuringCallback
            .slice(0, eventsDuringCallback + 1)
            .map((factory, i) => factory(`Test Event During Callback Content ${suffix} ${i}`))
        })
      }
    }
  }
  return steps
}

function RunSteps(steps: Step[]) {
  describe(steps.map(step => step.description).join(` -> `), () => {
    let mailbox: IMailbox<SingleKeyValueOf<IEvent>>
    let mailboxPush: jasmine.Spy
    let mailboxShift: jasmine.Spy
    let eventHandler: MultiEventHandler<IEvent>
    let eventHandlerA: jasmine.Spy
    let eventHandlerB: jasmine.Spy
    let eventHandlerC: jasmine.Spy
    let eventHandlerD: jasmine.Spy
    let eventHandlerE: jasmine.Spy
    let errorHandler: jasmine.Spy
    let actor: Actor<IEvent>
    beforeAll(async () => {
      mailboxPush = jasmine.createSpy()
      mailboxShift = jasmine.createSpy()
      mailboxShift.and.callFake(() => {
        const stepId = mailboxShift.calls.count()
        if (stepId < steps.length) {
          const step = steps[stepId]
          if (step.eventAvailableImmediately) {
            return step.event
          }
        }
        return undefined
      })
      mailbox = {
        push: mailboxPush,
        shift: mailboxShift
      }
      eventHandlerA = jasmine.createSpy()
      eventHandlerB = jasmine.createSpy()
      eventHandlerB.and.callFake(EventHandlerCalled)
      eventHandlerC = jasmine.createSpy()
      eventHandlerC.and.callFake(EventHandlerCalled)
      eventHandlerD = jasmine.createSpy()
      eventHandlerD.and.callFake(EventHandlerCalled)
      eventHandlerE = jasmine.createSpy()
      async function EventHandlerCalled(e: string) {
        const stepId = mailboxShift.calls.count()
        if (stepId < steps.length) {
          const step = steps[stepId]
          if (step.asynchronous) {
            await nextTick()
          }

          step.eventsDuringCallback.forEach(event => actor.tell(event))
          if (step.reason) {
            throw step.reason
          }
        }
      }
      eventHandler = {
        testKeyA: eventHandlerA,
        testKeyB: eventHandlerB,
        testKeyC: eventHandlerC,
        testKeyD: eventHandlerD,
        testKeyE: eventHandlerE
      }
      errorHandler = jasmine.createSpy()
      actor = new Actor<IEvent>(mailbox, eventHandler, errorHandler)
      for (const step of steps) {
        if (!step.eventAvailableImmediately) {
          actor.tell(step.event)
          await nextTick()
          await nextTick()
        }
        if (step.asynchronous) {
          await nextTick()
          await nextTick()
        }
      }
    })
    it(
      `pushes the expected number of events to the mailbox`,
      () => expect(mailboxPush).toHaveBeenCalledTimes(
        steps
          .map(step => step.eventsDuringCallback.length)
          .reduce((a, b) => a + b, 0)
      )
    )
    it(
      `pushes every expected event to the mailbox`, () => steps
        .forEach(step => step.eventsDuringCallback
          .forEach(event => expect(mailboxPush).toHaveBeenCalledWith(event))
        )
    )
    it(
      `shifts from the mailbox the expected number of times`,
      () => expect(mailboxShift).toHaveBeenCalledTimes(steps.length)
    )
    it(
      `handles the expected number of events`,
      () => {
        expect(eventHandlerA).toHaveBeenCalledTimes(0)
        expect(eventHandlerB).toHaveBeenCalledTimes(
          steps.filter(step => step.event.key == `testKeyB`).length
        )
        expect(eventHandlerC).toHaveBeenCalledTimes(
          steps.filter(step => step.event.key == `testKeyC`).length
        )
        expect(eventHandlerD).toHaveBeenCalledTimes(
          steps.filter(step => step.event.key == `testKeyD`).length
        )
        expect(eventHandlerE).toHaveBeenCalledTimes(0)
      }
    )
    it(
      `handles the expected events`,
      () => steps.forEach(step => {
        switch (step.event.key) {
          case `testKeyB`:
            expect(eventHandlerB).toHaveBeenCalledWith(step.event.value)
            break
          case `testKeyC`:
            expect(eventHandlerC).toHaveBeenCalledWith(step.event.value)
            break
          case `testKeyD`:
            expect(eventHandlerD).toHaveBeenCalledWith(step.event.value)
            break
        }
      })
    )
    it(
      `handles the expected number of errors`,
      () => expect(errorHandler)
        .toHaveBeenCalledTimes(steps.filter(step => step.reason).length)
    )
  })
}

function EventFactoryB(content: string): SingleKeyValueOf<IEvent> {
  return {
    key: `testKeyB`,
    value: content
  }
}

function EventFactoryC(content: string): SingleKeyValueOf<IEvent> {
  return {
    key: `testKeyC`,
    value: content
  }
}

function EventFactoryD(content: string): SingleKeyValueOf<IEvent> {
  return {
    key: `testKeyD`,
    value: content
  }
}

RunSteps([])

describe(`tell`, () => {
  GenerateStep(EventFactoryC, [EventFactoryB, EventFactoryD, EventFactoryC], `A`, false)
    .forEach(a => {
      RunSteps([a])
      GenerateStep(EventFactoryD, [EventFactoryC, EventFactoryD, EventFactoryB], `B`, false)
        .forEach(b => {
          RunSteps([a, b])
          GenerateStep(EventFactoryB, [EventFactoryD, EventFactoryB, EventFactoryC], `C`, false)
            .forEach(c => RunSteps([a, b, c]))
          GenerateStep(EventFactoryB, [EventFactoryD, EventFactoryB, EventFactoryC], `C`, true).forEach(c => RunSteps([a, b, c]))
        })
      GenerateStep(EventFactoryD, [EventFactoryC, EventFactoryD, EventFactoryB], `B`, true)
        .forEach(b => {
          RunSteps([a, b])
          GenerateStep(EventFactoryB, [EventFactoryD, EventFactoryB, EventFactoryC], `C`, false).forEach(c => RunSteps([a, b, c]))
          GenerateStep(EventFactoryB, [EventFactoryD, EventFactoryB, EventFactoryC], `C`, true).forEach(c => RunSteps([a, b, c]))
        })
    })
})
