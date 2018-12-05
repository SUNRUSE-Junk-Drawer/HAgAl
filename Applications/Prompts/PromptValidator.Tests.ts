import "jasmine"
import IJsonObject from "../../IJsonObject"
import { SingleKeyValueOf } from "../../ISingleKeyValueOf"
import PromptValidator from "./PromptValidator"
import * as IPrompt from "./IPrompt"

interface IEvent extends IJsonObject {
  readonly eventContent: string
}

const promptValidator = new PromptValidator<IEvent>()

describe(`back`, () => {
  let result:
    | { readonly type: `invalidControl` }
    | {
      readonly type: `success`
      readonly event: IEvent
    }
  Run(`none`, 0, spies => null)
  Run(`text`, 1, spies => ({
    key: `text`,
    value: {
      minimumLength: 10,
      maximumLength: 25,
      onEntry: spies[0]
    }
  }))
  Run(`password`, 1, spies => ({
    key: `password`,
    value: {
      minimumLength: 10,
      maximumLength: 25,
      onEntry: spies[0]
    }
  }))
  Run(`number`, 1, spies => ({
    key: `number`,
    value: {
      minimum: 5.4,
      maximum: 18.7,
      step: 0.4,
      onEntry: spies[0]
    }
  }))
  Run(`multiple choice`, 4, spies => ({
    key: `multipleChoice`,
    value: {
      options: [{
        label: `Test Option Label A`,
        onSelection: spies[0]
      }, {
        label: `Test Option Label B`,
        onSelection: spies[1]
      }, {
        label: `Test Option Label C`,
        onSelection: spies[2]
      }, {
        label: `Test Option Label D`,
        onSelection: spies[3]
      }]
    }
  }))
  function Run(
    description: string,
    numberOfSpies: number,
    controlFactory: (spies: jasmine.Spy[]) =>
      | null
      | SingleKeyValueOf<IPrompt.IControl<IEvent>>
  ): void {
    describe(description, () => {
      let spies: jasmine.Spy[]
      beforeEach(() => {
        spies = []
        while (spies.length < numberOfSpies) {
          spies.push(jasmine.createSpy())
        }
      })
      describe(`without back button`, () => {
        beforeEach(() => result = promptValidator.back({
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: controlFactory(spies),
          onBack: null
        }))
        it(
          `returns type "invalidControl"`,
          () => expect(result).toEqual({ type: `invalidControl` })
        )
        it(
          `does not execute any methods on the control`,
          () => spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
        )
      })
      describe(`with back button`, () => {
        let onBack: jasmine.Spy
        beforeEach(() => {
          onBack = jasmine.createSpy()
          onBack.and.returnValue({ eventContent: `Test Event Content` })
          result = promptValidator.back({
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: controlFactory(spies),
            onBack
          })
        })
        it(
          `generates one event from the back button`,
          () => expect(onBack).toHaveBeenCalledTimes(1)
        )
        it(
          `returns type "success" and the event`,
          () => expect(result).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
        it(
          `does not execute any methods on the control`,
          () => spies.forEach(spy => expect(spy).not.toHaveBeenCalled())
        )
      })
    })
  }
})

describe(`text`, () => {
  RunIgnoringBackButton(
    `none`,
    0,
    (spies, onBack) => promptValidator.text(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: null,
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
    }
  )

  describe(`text`, () => {
    RunIgnoringBackButton(
      `too short`,
      1,
      (spies, onBack) => promptValidator.text(
        ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `text`,
            value: {
              minimumLength: 18,
              maximumLength: 25,
              onEntry: spies[0]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "tooShort"`,
          () => expect(resultFactory()).toEqual({ type: `tooShort` })
        )
        it(
          `does not generate an event from text entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
        )
      }
    )

    RunIgnoringBackButton(
      `minimum length`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.text(
          ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `text`,
              value: {
                minimumLength: 17,
                maximumLength: 25,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from text entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered text`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledWith(`test example text`)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `maximum length`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.text(
          ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `text`,
              value: {
                minimumLength: 10,
                maximumLength: 17,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from text entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered text`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledWith(`test example text`)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `too long`,
      1,
      (spies, onBack) => promptValidator.text(
        ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `text`,
            value: {
              minimumLength: 10,
              maximumLength: 16,
              onEntry: spies[0]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "tooLong"`,
          () => expect(resultFactory()).toEqual({ type: `tooLong` })
        )
        it(
          `does not generate an event from text entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
        )
      }
    )
  })

  RunIgnoringBackButton(
    `password`,
    1,
    (spies, onBack) => promptValidator.text(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `password`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `number`,
    1,
    (spies, onBack) => promptValidator.text(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `number`,
          value: {
            minimum: 5.4,
            maximum: 18.7,
            step: 0.4,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from number entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `multiple choice`,
    4,
    (spies, onBack) => promptValidator.text(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `multipleChoice`,
          value: {
            options: [{
              label: `Test Option Label A`,
              onSelection: spies[0]
            }, {
              label: `Test Option Label B`,
              onSelection: spies[1]
            }, {
              label: `Test Option Label C`,
              onSelection: spies[2]
            }, {
              label: `Test Option Label D`,
              onSelection: spies[3]
            }]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from any option`,
        () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
      )
    }
  )
})

describe(`password`, () => {
  RunIgnoringBackButton(
    `none`,
    0,
    (spies, onBack) => promptValidator.password(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: null,
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
    }
  )

  RunIgnoringBackButton(
    `text`,
    1,
    (spies, onBack) => promptValidator.password(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `text`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from text entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  describe(`password`, () => {
    RunIgnoringBackButton(
      `too short`,
      1,
      (spies, onBack) => promptValidator.password(
        ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `password`,
            value: {
              minimumLength: 25,
              maximumLength: 33,
              onEntry: spies[0]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "tooShort"`,
          () => expect(resultFactory()).toEqual({ type: `tooShort` })
        )
        it(
          `does not generate an event from password entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
        )
      }
    )

    RunIgnoringBackButton(
      `minimum length`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.password(
          ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `password`,
              value: {
                minimumLength: 24,
                maximumLength: 33,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from text entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered password`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(`tEsT \t \r exaMPLE \n  text`)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `maximum length`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.password(
          ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `password`,
              value: {
                minimumLength: 10,
                maximumLength: 24,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from password entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered password`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(`tEsT \t \r exaMPLE \n  text`)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `too long`,
      1,
      (spies, onBack) => promptValidator.password(
        ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `password`,
            value: {
              minimumLength: 10,
              maximumLength: 23,
              onEntry: spies[0]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "tooLong"`,
          () => expect(resultFactory()).toEqual({ type: `tooLong` })
        )
        it(
          `does not generate an event from password entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
        )
      }
    )
  })

  RunIgnoringBackButton(
    `number`,
    1,
    (spies, onBack) => promptValidator.password(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `number`,
          value: {
            minimum: 5.4,
            maximum: 18.7,
            step: 0.4,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from number entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `multiple choice`,
    4,
    (spies, onBack) => promptValidator.password(
      ` \n \n    \t \r tEsT \t \r exaMPLE \n  text   \t \t \r \n `,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `multipleChoice`,
          value: {
            options: [{
              label: `Test Option Label A`,
              onSelection: spies[0]
            }, {
              label: `Test Option Label B`,
              onSelection: spies[1]
            }, {
              label: `Test Option Label C`,
              onSelection: spies[2]
            }, {
              label: `Test Option Label D`,
              onSelection: spies[3]
            }]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from any option`,
        () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
      )
    }
  )
})

describe(`number`, () => {
  RunIgnoringBackButton(
    `none`,
    0,
    (spies, onBack) => promptValidator.number(
      7.6,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: null,
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
    }
  )

  RunIgnoringBackButton(
    `text`,
    1,
    (spies, onBack) => promptValidator.number(
      7.6,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `text`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from text entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `password`,
    1,
    (spies, onBack) => promptValidator.number(
      7.6,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `password`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  describe(`number`, () => {
    RunIgnoringBackButton(
      `valid`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          7.6,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.4,
                maximum: 18.7,
                step: 0.4,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from number entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered number`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(7.6)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `invalid step`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          7.7,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.4,
                maximum: 18.7,
                step: 0.4,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `returns type "invalidStep"`,
          () => expect(resultFactory()).toEqual({ type: `invalidStep` })
        )
        it(
          `does not generate an event from number entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled
        )
      }
    )

    RunIgnoringBackButton(
      `minimum`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          5.6,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.6,
                maximum: 18.4,
                step: 0.2,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from number entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered number`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(5.6)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `maximum`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          18.4,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.6,
                maximum: 18.4,
                step: 0.2,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from number entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered number`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(18.4)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `less than minimum`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          5.4,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.6,
                maximum: 18.4,
                step: 0.2,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `returns type "lessThanMinimum"`,
          () => expect(resultFactory()).toEqual({ type: `lessThanMinimum` })
        )
        it(
          `does not generate an event from number entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled
        )
      }
    )

    RunIgnoringBackButton(
      `greater than maximum`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          18.6,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: 5.6,
                maximum: 18.4,
                step: 0.2,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `returns type "greaterThanMaximum"`,
          () => expect(resultFactory()).toEqual({ type: `greaterThanMaximum` })
        )
        it(
          `does not generate an event from number entry`,
          () => expect(spiesFactory()[0]).not.toHaveBeenCalled
        )
      }
    )

    RunIgnoringBackButton(
      `valid negative`,
      1,
      (spies, onBack) => {
        spies[0].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.number(
          -7.6,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `number`,
              value: {
                minimum: -18.7,
                maximum: -5.4,
                step: 0.4,
                onEntry: spies[0]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from number entry`,
          () => expect(spiesFactory()[0]).toHaveBeenCalledTimes(1)
        )
        it(
          `generates the event using the entered number`,
          () => expect(spiesFactory()[0])
            .toHaveBeenCalledWith(-7.6)
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )
  })

  RunIgnoringBackButton(
    `multiple choice`,
    4,
    (spies, onBack) => promptValidator.number(
      7.6,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `multipleChoice`,
          value: {
            options: [{
              label: `Test Option Label A`,
              onSelection: spies[0]
            }, {
              label: `Test Option Label B`,
              onSelection: spies[1]
            }, {
              label: `Test Option Label C`,
              onSelection: spies[2]
            }, {
              label: `Test Option Label D`,
              onSelection: spies[3]
            }]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from any option`,
        () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
      )
    }
  )
})

describe(`multipleChoiceByLabel`, () => {
  RunIgnoringBackButton(
    `none`,
    0,
    (spies, onBack) => promptValidator.multipleChoiceByLabel(
      `Test Option Label`,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: null,
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
    }
  )

  RunIgnoringBackButton(
    `text`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByLabel(
      `Test Option Label`,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `text`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `password`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByLabel(
      `Test Option Label`,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `password`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `number`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByLabel(
      `Test Option Label`,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `number`,
          value: {
            minimum: 5.4,
            maximum: 18.7,
            step: 0.4,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from number entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  describe(`multiple choice`, () => {
    RunIgnoringBackButton(
      `invalid`,
      4,
      (spies, onBack) => promptValidator.multipleChoiceByLabel(
        `Test Invalid Option Label`,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `multipleChoice`,
            value: {
              options: [{
                label: `Test Option Label A`,
                onSelection: spies[0]
              }, {
                label: `Test Option Label B`,
                onSelection: spies[1]
              }, {
                label: `Test Option Label C`,
                onSelection: spies[2]
              }, {
                label: `Test Option Label D`,
                onSelection: spies[3]
              }]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "invalidLabel"`,
          () => expect(resultFactory()).toEqual({ type: `invalidLabel` })
        )
        it(
          `does not generate an event from any option`,
          () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
        )
      }
    )

    RunIgnoringBackButton(
      `valid`,
      4,
      (spies, onBack) => {
        spies[2].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.multipleChoiceByLabel(
          `Test Option Label C`,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `multipleChoice`,
              value: {
                options: [{
                  label: `Test Option Label A`,
                  onSelection: spies[0]
                }, {
                  label: `Test Option Label B`,
                  onSelection: spies[1]
                }, {
                  label: `Test Option Label C`,
                  onSelection: spies[2]
                }, {
                  label: `Test Option Label D`,
                  onSelection: spies[3]
                }]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from selected option`,
          () => expect(spiesFactory()[2]).toHaveBeenCalledTimes(1)
        )
        it(
          `does not generate events from the other options`,
          () => {
            expect(spiesFactory()[0]).not.toHaveBeenCalled()
            expect(spiesFactory()[1]).not.toHaveBeenCalled()
            expect(spiesFactory()[3]).not.toHaveBeenCalled()
          }
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )
  })
})

describe(`multipleChoiceByIndex`, () => {
  RunIgnoringBackButton(
    `none`,
    0,
    (spies, onBack) => promptValidator.multipleChoiceByIndex(
      1,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: null,
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
    }
  )

  RunIgnoringBackButton(
    `text`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByIndex(
      1,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `text`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `password`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByIndex(
      1,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `password`,
          value: {
            minimumLength: 10,
            maximumLength: 25,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from password entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  RunIgnoringBackButton(
    `number`,
    1,
    (spies, onBack) => promptValidator.multipleChoiceByIndex(
      1,
      {
        label: `Test Prompt Label`,
        description: `Test Prompt Description`,
        control: {
          key: `number`,
          value: {
            minimum: 5.4,
            maximum: 18.7,
            step: 0.4,
            onEntry: spies[0]
          }
        },
        onBack
      }
    ),
    (spiesFactory, resultFactory) => {
      it(
        `returns type "invalidControl"`,
        () => expect(resultFactory()).toEqual({ type: `invalidControl` })
      )
      it(
        `does not generate an event from number entry`,
        () => expect(spiesFactory()[0]).not.toHaveBeenCalled()
      )
    }
  )

  describe(`multiple choice`, () => {
    RunIgnoringBackButton(
      `out of range`,
      4,
      (spies, onBack) => promptValidator.multipleChoiceByIndex(
        4,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `multipleChoice`,
            value: {
              options: [{
                label: `Test Option Label A`,
                onSelection: spies[0]
              }, {
                label: `Test Option Label B`,
                onSelection: spies[1]
              }, {
                label: `Test Option Label C`,
                onSelection: spies[2]
              }, {
                label: `Test Option Label D`,
                onSelection: spies[3]
              }]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "indexOutOfRange"`,
          () => expect(resultFactory()).toEqual({ type: `indexOutOfRange` })
        )
        it(
          `does not generate an event from any option`,
          () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
        )
      }
    )

    RunIgnoringBackButton(
      `further out of range`,
      4,
      (spies, onBack) => promptValidator.multipleChoiceByIndex(
        5,
        {
          label: `Test Prompt Label`,
          description: `Test Prompt Description`,
          control: {
            key: `multipleChoice`,
            value: {
              options: [{
                label: `Test Option Label A`,
                onSelection: spies[0]
              }, {
                label: `Test Option Label B`,
                onSelection: spies[1]
              }, {
                label: `Test Option Label C`,
                onSelection: spies[2]
              }, {
                label: `Test Option Label D`,
                onSelection: spies[3]
              }]
            }
          },
          onBack
        }
      ),
      (spiesFactory, resultFactory) => {
        it(
          `returns type "indexOutOfRange"`,
          () => expect(resultFactory()).toEqual({ type: `indexOutOfRange` })
        )
        it(
          `does not generate an event from any option`,
          () => spiesFactory().forEach(spy => expect(spy).not.toHaveBeenCalled())
        )
      }
    )

    RunIgnoringBackButton(
      `valid`,
      4,
      (spies, onBack) => {
        spies[1].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.multipleChoiceByIndex(
          1,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `multipleChoice`,
              value: {
                options: [{
                  label: `Test Option Label A`,
                  onSelection: spies[0]
                }, {
                  label: `Test Option Label B`,
                  onSelection: spies[1]
                }, {
                  label: `Test Option Label C`,
                  onSelection: spies[2]
                }, {
                  label: `Test Option Label D`,
                  onSelection: spies[3]
                }]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from selected option`,
          () => expect(spiesFactory()[1]).toHaveBeenCalledTimes(1)
        )
        it(
          `does not generate events from the other options`,
          () => {
            expect(spiesFactory()[0]).not.toHaveBeenCalled()
            expect(spiesFactory()[2]).not.toHaveBeenCalled()
            expect(spiesFactory()[3]).not.toHaveBeenCalled()
          }
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )

    RunIgnoringBackButton(
      `valid last`,
      4,
      (spies, onBack) => {
        spies[3].and.returnValue({ eventContent: `Test Event Content` })
        return promptValidator.multipleChoiceByIndex(
          3,
          {
            label: `Test Prompt Label`,
            description: `Test Prompt Description`,
            control: {
              key: `multipleChoice`,
              value: {
                options: [{
                  label: `Test Option Label A`,
                  onSelection: spies[0]
                }, {
                  label: `Test Option Label B`,
                  onSelection: spies[1]
                }, {
                  label: `Test Option Label C`,
                  onSelection: spies[2]
                }, {
                  label: `Test Option Label D`,
                  onSelection: spies[3]
                }]
              }
            },
            onBack
          }
        )
      },
      (spiesFactory, resultFactory) => {
        it(
          `generates one event from selected option`,
          () => expect(spiesFactory()[3]).toHaveBeenCalledTimes(1)
        )
        it(
          `does not generate events from the other options`,
          () => {
            expect(spiesFactory()[0]).not.toHaveBeenCalled()
            expect(spiesFactory()[1]).not.toHaveBeenCalled()
            expect(spiesFactory()[2]).not.toHaveBeenCalled()
          }
        )
        it(
          `returns type "success" and the event`,
          () => expect(resultFactory()).toEqual({
            type: `success`,
            event: { eventContent: `Test Event Content` }
          })
        )
      }
    )
  })
})

function RunIgnoringBackButton<T>(
  description: string,
  numberOfSpies: number,
  act: (spies: jasmine.Spy[], onBack: null | jasmine.Spy) => T,
  assert: (spiesFactory: () => jasmine.Spy[], resultFactory: () => T) => void
): void {
  describe(description, () => {
    let spies: jasmine.Spy[]
    beforeEach(() => {
      spies = []
      while (spies.length < numberOfSpies) {
        spies.push(jasmine.createSpy())
      }
    })
    let result: T
    describe(`without a back button`, () => {
      beforeEach(() => result = act(spies, null))
      assert(() => spies, () => result)
    })
    describe(`with a back button`, () => {
      let onBack: jasmine.Spy
      beforeEach(() => {
        onBack = jasmine.createSpy()
        result = act(spies, onBack)
      })
      assert(() => spies, () => result)
      it(
        `does not generate an event from the back button`,
        () => expect(onBack).not.toHaveBeenCalled()
      )
    })
  })
}
