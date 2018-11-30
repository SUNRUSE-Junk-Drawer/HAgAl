import StateContainer from "./StateContainer"

enum State {
  A,
  FirstChange,
  C,
  Initial,
  E,
  SecondChange,
  G
}

let stateContainer: StateContainer<State>
let got: State
beforeEach(() => stateContainer = new StateContainer(State.Initial))

ExpectState(State.Initial, () => { })

function ExpectState(state: State, then: Function): void {
  describe(`get`, () => {
    beforeEach(() => got = stateContainer.get())
    it(`returns the expected state`, () => expect(got).toEqual(state))
    then()
    describe(`get`, () => {
      beforeEach(() => got = stateContainer.get())
      it(`returns the expected state`, () => expect(got).toEqual(state))
      then()
    })
  })
}

describe(`set`, () => {
  beforeEach(() => stateContainer.set(State.FirstChange))

  ExpectState(State.FirstChange, SetAgain)
  SetAgain()

  function SetAgain(): void {
    describe(`set`, () => {
      beforeEach(() => stateContainer.set(State.SecondChange))
      ExpectState(State.SecondChange, () => { })
    })
  }
})
