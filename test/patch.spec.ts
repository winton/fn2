import load from "@loaded/loaded"

import expect from "./expect"
import Fn2 from "../src"
import patch from "../src/patch"

beforeEach(() => patch.reset())

it("patches", () => {
  expect.assertions(1)

  load({ Fn2, patch })

  class A {
    patchMe(hi: string): void {}
  }

  const a = new A()

  patch.add(a, "a", "patchMe", {
    fn: (hi: string) => expect(hi).toBe("hi"),
  })

  a.patchMe("hi")
})

it("patches (with return)", () => {
  expect.assertions(1)

  load({ Fn2, patch })

  class A {
    patchMe(hi: string): void {}
  }

  const a = new A()

  patch.add(a, "a", "patchMe", {
    fn: (hi: string) => true,
    return: "fn",
  })

  expect(a.patchMe("hi")).toBe(true)
})

it("patches (with global)", () => {
  expect.assertions(2)

  load({ Fn2, patch })

  patch.addGlobal("*", "*", {
    fn2: (hi: string) => expect(hi).toBe("hi"),
  })

  class A {
    patchMe(hi: string): void {}
  }

  const a = new A()

  patch.add(a, "a", "patchMe", {
    fn: (hi: string) => expect(hi).toBe("hi"),
  })

  a.patchMe("hi")
})

it("patches (with global after add)", () => {
  expect.assertions(2)

  load({ Fn2, patch })

  class A {
    patchMe(hi: string): void {}
  }

  const a = new A()

  patch.add(a, "a", "patchMe", {
    fn: (hi: string) => expect(hi).toBe("hi"),
  })

  patch.addGlobal("*", "*", {
    fn2: (hi: string) => expect(hi).toBe("hi"),
  })

  a.patchMe("hi")
})
