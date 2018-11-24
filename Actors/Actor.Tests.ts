import "jasmine"
import * as util from "util"
import Actor from "./Actor"
import IMailbox from "./IMailbox"
import IEventHandler from "./IEventHandler"

const nextTick = util.promisify(process.nextTick)

interface IEvent {
  readonly eventContent: string
}

interface IReason {
  readonly reasonContent: string
}

type Step = {
  readonly description: string
  readonly asynchronous: boolean
  readonly event: IEvent
  readonly eventAvailableImmediately: boolean
  readonly reason: null | IReason
  readonly eventsDuringCallback: IEvent[]
}

function GenerateStep(suffix: string, eventAvailableImmediately: boolean): Step[] {
  const steps: Step[] = []
  for (const asynchronous of [false, true]) {
    for (const reason of [false, true]) {
      for (const eventsDuringCallback of [0, 1, 2, 3]) {
        steps.push({
          description: `${eventAvailableImmediately ? `continued by` : ``} ${reason ? `unsuccessful` : `successful`} ${asynchronous ? `asynchronous` : `synchronous`}ly handled event during which ${eventsDuringCallback} event(s) are raised`,
          asynchronous,
          event: { eventContent: `Test Event Content ${suffix}` },
          eventAvailableImmediately,
          reason: reason ? { reasonContent: `Test Reason Content ${suffix}` } : null,
          eventsDuringCallback: [0, 1, 2, 3].slice(eventsDuringCallback + 1).map(i => ({ eventContent: `Test Event During Callback Content ${suffix} ${i}` }))
        })
      }
    }
  }
  return steps
}

function RunSteps(steps: Step[]) {
  describe(steps.map(step => step.description).join(` -> `), () => {
    let mailbox: IMailbox<IEvent>
    let mailboxPush: jasmine.Spy
    let mailboxShift: jasmine.Spy
    let eventHandler: IEventHandler<IEvent>
    let eventHandlerHandle: jasmine.Spy
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
      eventHandlerHandle = jasmine.createSpy()
      eventHandlerHandle.and.callFake(async () => {
        const stepId = eventHandlerHandle.calls.count() - 1
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
      })
      eventHandler = {
        handle: eventHandlerHandle
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
      () => expect(eventHandlerHandle).toHaveBeenCalledTimes(steps.length)
    )
    it(
      `handles the expected events`,
      () => steps.forEach(step => expect(eventHandlerHandle)
        .toHaveBeenCalledWith(step.event))
    )
    it(
      `handles the expected number of errors`,
      () => expect(errorHandler)
        .toHaveBeenCalledTimes(steps.filter(step => step.reason).length)
    )
  })
}

RunSteps([])

describe(`tell`, () => {
  GenerateStep(`A`, false).forEach(a => {
    RunSteps([a])
    GenerateStep(`B`, false).forEach(b => {
      RunSteps([a, b])
      GenerateStep(`C`, false).forEach(c => RunSteps([a, b, c]))
      GenerateStep(`C`, true).forEach(c => RunSteps([a, b, c]))
    })
    GenerateStep(`B`, true).forEach(b => {
      RunSteps([a, b])
      GenerateStep(`C`, false).forEach(c => RunSteps([a, b, c]))
      GenerateStep(`C`, true).forEach(c => RunSteps([a, b, c]))
    })
  })
})
