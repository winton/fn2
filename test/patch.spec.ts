import expect from "./expect"
import Fn2 from "../src"
import patch from "../src/patch"
import load from "@loaded/loaded"

it("patches", () => {
  expect.assertions(1)

  load({ Fn2, patch })

  class A {
    patchMe(): void {}
  }

  const a = new A()

  patch.add("a", "patchMe", a, {
    fn: () => expect(1).toBe(1),
  })

  a.patchMe()
})
