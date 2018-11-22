import "jasmine"
import GenerateSessionId from "./GenerateSessionId"

it(
  `returns a string`,
  async () => expect(await GenerateSessionId())
    .toEqual(jasmine.any(String))
)

it(
  `returns a different value every call`,
  async () => expect(await GenerateSessionId())
    .not.toEqual(await GenerateSessionId())
)

it(
  `returns the same length every call`,
  async () => expect((await GenerateSessionId()).length)
    .toEqual((await GenerateSessionId()).length)
)
