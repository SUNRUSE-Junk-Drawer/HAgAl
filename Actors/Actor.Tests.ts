import "jasmine"
import * as util from "util"
import { SingleKeyValueOf } from "../ISingleKeyValueOf"
import Actor from "./Actor"
import IMailbox from "./IMailbox"
import { MultiMessageHandler } from "./IMultiMessageHandler"

const nextTick = util.promisify(process.nextTick)

interface IMessage {
  readonly testKeyA: boolean
  readonly testKeyB: string
  readonly testKeyC: string
  readonly testKeyD: string
  readonly testKeyE: number
}

interface IReason {
  readonly reasonContent: string
}

type MessageFactory = (content: string) => SingleKeyValueOf<IMessage>

type Step = {
  readonly description: string
  readonly asynchronous: boolean
  readonly message: SingleKeyValueOf<IMessage>
  readonly messageAvailableImmediately: boolean
  readonly reason: null | IReason
  readonly messagesDuringCallback: SingleKeyValueOf<IMessage>[]
}

function GenerateStep(messageFactory: MessageFactory, messageFactoriesDuringCallback: MessageFactory[], suffix: string, messageAvailableImmediately: boolean): Step[] {
  const steps: Step[] = []
  for (const asynchronous of [false, true]) {
    for (const reason of [false, true]) {
      for (const messagesDuringCallback of [0, 1, 2, 3]) {
        steps.push({
          description: `${messageAvailableImmediately ? `continued by` : ``} ${reason ? `unsuccessful` : `successful`} ${asynchronous ? `asynchronous` : `synchronous`}ly handled message during which ${messagesDuringCallback} messages(s) are received`,
          asynchronous,
          message: messageFactory(`Test Message Content ${suffix}`),
          messageAvailableImmediately,
          reason: reason ? { reasonContent: `Test Reason Content ${suffix}` } : null,
          messagesDuringCallback: messageFactoriesDuringCallback
            .slice(0, messagesDuringCallback + 1)
            .map((factory, i) => factory(`Test Message During Callback Content ${suffix} ${i}`))
        })
      }
    }
  }
  return steps
}

function RunSteps(steps: Step[]) {
  describe(steps.map(step => step.description).join(` -> `), () => {
    let mailbox: IMailbox<SingleKeyValueOf<IMessage>>
    let mailboxPush: jasmine.Spy
    let mailboxShift: jasmine.Spy
    let messageHandler: MultiMessageHandler<IMessage>
    let messageHandlerA: jasmine.Spy
    let messageHandlerB: jasmine.Spy
    let messageHandlerC: jasmine.Spy
    let messageHandlerD: jasmine.Spy
    let messageHandlerE: jasmine.Spy
    let errorHandler: jasmine.Spy
    let actor: Actor<IMessage>
    beforeAll(async () => {
      mailboxPush = jasmine.createSpy()
      mailboxShift = jasmine.createSpy()
      mailboxShift.and.callFake(() => {
        const stepId = mailboxShift.calls.count()
        if (stepId < steps.length) {
          const step = steps[stepId]
          if (step.messageAvailableImmediately) {
            return step.message
          }
        }
        return undefined
      })
      mailbox = {
        push: mailboxPush,
        shift: mailboxShift
      }
      messageHandlerA = jasmine.createSpy()
      messageHandlerB = jasmine.createSpy()
      messageHandlerB.and.callFake(MessageHandlerCalled)
      messageHandlerC = jasmine.createSpy()
      messageHandlerC.and.callFake(MessageHandlerCalled)
      messageHandlerD = jasmine.createSpy()
      messageHandlerD.and.callFake(MessageHandlerCalled)
      messageHandlerE = jasmine.createSpy()
      async function MessageHandlerCalled(e: string) {
        const stepId = mailboxShift.calls.count()
        if (stepId < steps.length) {
          const step = steps[stepId]
          if (step.asynchronous) {
            await nextTick()
          }

          step.messagesDuringCallback.forEach(message => actor.tell(message))
          if (step.reason) {
            throw step.reason
          }
        }
      }
      messageHandler = {
        testKeyA: messageHandlerA,
        testKeyB: messageHandlerB,
        testKeyC: messageHandlerC,
        testKeyD: messageHandlerD,
        testKeyE: messageHandlerE
      }
      errorHandler = jasmine.createSpy()
      actor = new Actor<IMessage>(mailbox, messageHandler, errorHandler)
      for (const step of steps) {
        if (!step.messageAvailableImmediately) {
          actor.tell(step.message)
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
      `pushes the expected number of messages to the mailbox`,
      () => expect(mailboxPush).toHaveBeenCalledTimes(
        steps
          .map(step => step.messagesDuringCallback.length)
          .reduce((a, b) => a + b, 0)
      )
    )
    it(
      `pushes every expected message to the mailbox`, () => steps
        .forEach(step => step.messagesDuringCallback
          .forEach(message => expect(mailboxPush).toHaveBeenCalledWith(message))
        )
    )
    it(
      `shifts from the mailbox the expected number of times`,
      () => expect(mailboxShift).toHaveBeenCalledTimes(steps.length)
    )
    it(
      `handles the expected number of messages`,
      () => {
        expect(messageHandlerA).toHaveBeenCalledTimes(0)
        expect(messageHandlerB).toHaveBeenCalledTimes(
          steps.filter(step => step.message.key == `testKeyB`).length
        )
        expect(messageHandlerC).toHaveBeenCalledTimes(
          steps.filter(step => step.message.key == `testKeyC`).length
        )
        expect(messageHandlerD).toHaveBeenCalledTimes(
          steps.filter(step => step.message.key == `testKeyD`).length
        )
        expect(messageHandlerE).toHaveBeenCalledTimes(0)
      }
    )
    it(
      `handles the expected messages`,
      () => steps.forEach(step => {
        switch (step.message.key) {
          case `testKeyB`:
            expect(messageHandlerB).toHaveBeenCalledWith(
              jasmine.anything(),
              step.message.value
            )
            break
          case `testKeyC`:
            expect(messageHandlerC).toHaveBeenCalledWith(
              jasmine.anything(),
              step.message.value
            )
            break
          case `testKeyD`:
            expect(messageHandlerD).toHaveBeenCalledWith(
              jasmine.anything(),
              step.message.value
            )
            break
        }
      })
    )
    it(
      `provides a reference to itself when handling messages`,
      () => [messageHandlerB, messageHandlerC, messageHandlerD]
        .forEach(messageHandler => messageHandler
          .calls
          .allArgs()
          .forEach(call => expect(call[0]).toBe(actor))
        )
    )
    it(
      `handles the expected number of errors`,
      () => expect(errorHandler)
        .toHaveBeenCalledTimes(steps.filter(step => step.reason).length)
    )
  })
}

function MessageFactoryB(content: string): SingleKeyValueOf<IMessage> {
  return {
    key: `testKeyB`,
    value: content
  }
}

function MessageFactoryC(content: string): SingleKeyValueOf<IMessage> {
  return {
    key: `testKeyC`,
    value: content
  }
}

function MessageFactoryD(content: string): SingleKeyValueOf<IMessage> {
  return {
    key: `testKeyD`,
    value: content
  }
}

RunSteps([])

describe(`tell`, () => {
  GenerateStep(MessageFactoryC, [MessageFactoryB, MessageFactoryD, MessageFactoryC], `A`, false)
    .forEach(a => {
      RunSteps([a])
      GenerateStep(MessageFactoryD, [MessageFactoryC, MessageFactoryD, MessageFactoryB], `B`, false)
        .forEach(b => {
          RunSteps([a, b])
          GenerateStep(MessageFactoryB, [MessageFactoryD, MessageFactoryB, MessageFactoryC], `C`, false)
            .forEach(c => RunSteps([a, b, c]))
          GenerateStep(MessageFactoryB, [MessageFactoryD, MessageFactoryB, MessageFactoryC], `C`, true).forEach(c => RunSteps([a, b, c]))
        })
      GenerateStep(MessageFactoryD, [MessageFactoryC, MessageFactoryD, MessageFactoryB], `B`, true)
        .forEach(b => {
          RunSteps([a, b])
          GenerateStep(MessageFactoryB, [MessageFactoryD, MessageFactoryB, MessageFactoryC], `C`, false).forEach(c => RunSteps([a, b, c]))
          GenerateStep(MessageFactoryB, [MessageFactoryD, MessageFactoryB, MessageFactoryC], `C`, true).forEach(c => RunSteps([a, b, c]))
        })
    })
})
