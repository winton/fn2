import expect from "./expect"
import fn2 from "../src"

describe("fn2", () => {
  it("output", () => {
    expect(
      fn2({ hi: () => true }, { world: () => false })
    ).toEqual({ hi: true, world: false })
  })

  it("output async", async () => {
    expect(
      await fn2(
        { hi: async () => true },
        { world: async () => false }
      )
    ).toEqual({
      hi: true,
      world: false,
    })
  })

  it("order", () => {
    const calls = []
    fn2(
      { hi: () => calls.push("hi") },
      { world: () => calls.push("world") }
    )
    expect(calls).toEqual(["hi", "world"])
  })

  it("order async", async () => {
    const calls = []
    await fn2(
      { hi: async () => calls.push("hi") },
      { world: async () => calls.push("world") }
    )
    expect(calls).toEqual(["hi", "world"])
  })

  it("nest", () => {
    expect(
      fn2({
        hi: () => {
          return fn2({ test: () => "test" })
        },
      })
    ).toEqual({ hi: { test: "test" } })
  })

  it("nest async", async () => {
    expect(
      await fn2({
        hi: () => {
          return fn2({ test: async () => "test" })
        },
      })
    ).toEqual({ hi: { test: "test" } })
  })

  it("memo", () => {
    const memo = {}
    fn2(memo, [], { hi: () => true })
    expect(memo).toEqual({ hi: true })
  })

  it("memo async", async () => {
    const memo = {}
    await fn2(memo, [], { hi: async () => true })
    expect(memo).toEqual({ hi: true })
  })

  it("args", () => {
    fn2(["hi"], {
      hi: (x: string) => expect(x).toBe("hi"),
    })
  })

  it("args async", async () => {
    expect.assertions(1)
    await fn2(["hi"], {
      hi: async (x: string) => expect(x).toBe("hi"),
    })
  })
})
