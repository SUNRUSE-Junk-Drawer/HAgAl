import "jasmine"
import * as util from "util"
import IJsonObject from "./IJsonObject"
import Actor from "./Actor"
import IMailbox from "./IMailbox"
import IEventHandler from "./IEventHandler"

const nextTick = util.promisify(process.nextTick)

interface IEvent extends IJsonObject {
  readonly eventContent: string
}

interface IReason extends IJsonObject {
  readonly reasonContent: string
}

let mailbox: IMailbox<IEvent>
let mailboxPush: jasmine.Spy
let mailboxShift: jasmine.Spy
let eventHandler: IEventHandler<IEvent>
let eventHandlerHandle: jasmine.Spy
let errorHandler: jasmine.Spy
let actor: Actor<IEvent>
beforeEach(() => {
  mailboxPush = jasmine.createSpy()
  mailboxShift = jasmine.createSpy()
  mailbox = {
    push: mailboxPush,
    shift: mailboxShift
  }
  eventHandlerHandle = jasmine.createSpy()
  eventHandler = {
    handle: eventHandlerHandle
  }
  errorHandler = jasmine.createSpy()
  actor = new Actor<IEvent>(mailbox, eventHandler, errorHandler)
})

it(
  `does not push to the mailbox`,
  () => expect(mailboxPush).not.toHaveBeenCalled()
)
it(
  `does not shift from the mailbox`,
  () => expect(mailboxShift).not.toHaveBeenCalled()
)
it(
  `does not handle any events`,
  () => expect(eventHandlerHandle).not.toHaveBeenCalled()
)
it(
  `does not handle any errors`,
  () => expect(errorHandler).not.toHaveBeenCalled()
)

describe(`tell`, () => {
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

  function RunSteps(steps: Step[]) {
    describe(steps.map(step => step.description).join(` -> `), () => {
      beforeEach(async () => {
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
            .reduce((a, b) => a + b)
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
})
