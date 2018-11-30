import "jasmine"
import StateStore from "./StateStore"

enum State {
  EnsuresNotJustCheckingForTruthiness,
  SwapA,
  ChangedAFrom,
  D,
  E,
  F,
  Unchanged,
  SwapB,
  Removed,
  ChangedATo,
  K,
  L,
  M,
  N
}

let stateStore: StateStore<State>
beforeEach(() => stateStore = new StateStore<State>())

describe(`add`, () => {
  beforeEach(() => {
    stateStore.add(State.ChangedAFrom)
    stateStore.add(State.Unchanged)
    stateStore.add(State.SwapA)
    stateStore.add(State.Removed)
    stateStore.add(State.SwapB)
    stateStore.add(State.F)
  })
  it(`does nothing`, () => { })
  describe(`process`, () => {
    let handler: jasmine.Spy
    beforeEach(() => {
      handler = jasmine.createSpy()
      handler.and.callFake((state: State): State | null => {
        switch (state) {
          case State.ChangedAFrom:
            return State.ChangedATo
          case State.Unchanged:
            return State.Unchanged
          case State.SwapA:
            return State.SwapB
          case State.Removed:
            return null
          case State.SwapB:
            return State.SwapA
          case State.F:
            return State.EnsuresNotJustCheckingForTruthiness
          default:
            fail(state)
            return null
        }
      })
      stateStore.process(handler)
    })
    it(
      `executes the handler once per added state`,
      () => expect(handler).toHaveBeenCalledTimes(6)
    )
    it(
      `executes the handler with the first state`,
      () => expect(handler).toHaveBeenCalledWith(State.ChangedAFrom)
    )
    it(
      `executes the handler with the second state`,
      () => expect(handler).toHaveBeenCalledWith(State.Unchanged)
    )
    it(
      `executes the handler with the third state`,
      () => expect(handler).toHaveBeenCalledWith(State.SwapA)
    )
    it(
      `executes the handler with the fourth state`,
      () => expect(handler).toHaveBeenCalledWith(State.Removed)
    )
    it(
      `executes the handler with the fifth state`,
      () => expect(handler).toHaveBeenCalledWith(State.SwapB)
    )
    it(
      `executes the handler with the sixth state`,
      () => expect(handler).toHaveBeenCalledWith(State.F)
    )
    describe(`add`, () => {
      beforeEach(() => {
        handler.calls.reset()
        stateStore.add(State.E)
        stateStore.add(State.M)
        stateStore.add(State.L)
      })
      it(
        `does not execute the original handler`,
        () => expect(handler).not.toHaveBeenCalled()
      )
      describe(`process`, () => {
        let subsequentHandler: jasmine.Spy
        beforeEach(() => {
          subsequentHandler = jasmine.createSpy()
          subsequentHandler.and.returnValue(null)
          stateStore.process(subsequentHandler)
        })
        it(
          `does not execute the original handler`,
          () => expect(handler).not.toHaveBeenCalled()
        )
        it(
          `executes the subsequent handler once per state which subsequently `
          + ` added or not removed`,
          () => expect(subsequentHandler).toHaveBeenCalledTimes(8)
        )
        it(
          `executes the subsequent handler with the first unremoved state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.ChangedATo)
        )
        it(
          `executes the subsequent handler with the second unremoved state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.Unchanged)
        )
        it(
          `executes the subsequent handler with the third unremoved state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.SwapB)
        )
        it(
          `executes the subsequent handler with the fourth unremoved state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.SwapA)
        )
        it(
          `executes the subsequent handler with the fifth unremoved state`,
          () => expect(subsequentHandler)
            .toHaveBeenCalledWith(State.EnsuresNotJustCheckingForTruthiness)
        )
        it(
          `executes the subsequent handler with the first subsequently added `
          + `state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.E)
        )
        it(
          `executes the subsequent handler with the second subsequently added `
          + `state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.M)
        )
        it(
          `executes the subsequent handler with the third subsequently added `
          + `state`,
          () => expect(subsequentHandler).toHaveBeenCalledWith(State.L)
        )
      })
    })
    describe(`process`, () => {
      let subsequentHandler: jasmine.Spy
      beforeEach(() => {
        handler.calls.reset()
        subsequentHandler = jasmine.createSpy()
        subsequentHandler.and.returnValue(null)
        stateStore.process(subsequentHandler)
      })
      it(
        `does not execute the original handler`,
        () => expect(handler).not.toHaveBeenCalled()
      )
      it(
        `executes the subsequent handler once per state which was not removed`,
        () => expect(subsequentHandler).toHaveBeenCalledTimes(5)
      )
      it(
        `executes the subsequent handler with the first unremoved state`,
        () => expect(subsequentHandler).toHaveBeenCalledWith(State.ChangedATo)
      )
      it(
        `executes the subsequent handler with the second unremoved state`,
        () => expect(subsequentHandler).toHaveBeenCalledWith(State.Unchanged)
      )
      it(
        `executes the subsequent handler with the third unremoved state`,
        () => expect(subsequentHandler).toHaveBeenCalledWith(State.SwapB)
      )
      it(
        `executes the subsequent handler with the fourth unremoved state`,
        () => expect(subsequentHandler).toHaveBeenCalledWith(State.SwapA)
      )
      it(
        `executes the subsequent handler with the fifth unremoved state`,
        () => expect(subsequentHandler)
          .toHaveBeenCalledWith(State.EnsuresNotJustCheckingForTruthiness)
      )
    })
  })
})
