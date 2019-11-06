import expect from "./expect"
import Fn2 from "../src"

const emptyFn = (): void => {}

const fixture = (
  f1?: Function,
  f2?: Function,
  f3?: Function,
  f4?: Function
): Fn2 =>
  new Fn2(
    { args: ["test"], order: 1 },
    { f1: f1 || emptyFn },
    { f2: f2 || emptyFn },
    { args: [], order: -5 },
    { f3: f3 || emptyFn },
    { f4: f4 || emptyFn }
  )

it("add", () => {
  const group = fixture()
  expect(group.steps).toEqual([
    {
      args: ["test"],
      fns: { f1: expect.any(Function) },
      id: expect.any(String),
      order: 1,
    },
    {
      args: ["test"],
      fns: { f2: expect.any(Function) },
      id: expect.any(String),
      order: 2,
    },
    {
      args: [],
      fns: { f3: expect.any(Function) },
      id: expect.any(String),
      order: -5,
    },
    {
      args: [],
      fns: { f4: expect.any(Function) },
      id: expect.any(String),
      order: -4,
    },
  ])
})

it("run (sync)", () => {
  const calls = []
  const group = fixture(
    () => calls.push(1) && 1,
    () => calls.push(2) && 2,
    () => calls.push(3) && 3,
    () => calls.push(4) && 4
  )
  const out = group.run()
  expect(calls).toEqual([3, 4, 1, 2])
  expect(out).toEqual({ f1: 1, f2: 2, f3: 3, f4: 4 })
})

it("run (async)", async () => {
  const calls = []
  const group = fixture(
    async () => calls.push(1) && 1,
    async () => calls.push(2) && 2,
    async () => calls.push(3) && 3,
    async () => calls.push(4) && 4
  )
  const out = await group.run()
  expect(calls).toEqual([3, 4, 1, 2])
  expect(out).toEqual({ f1: 1, f2: 2, f3: 3, f4: 4 })
})

it("run (empty step)", () => {
  const out = new Fn2({}).run()
  expect(out).toEqual({})
})

it("run args", () => {
  const calls = []
  const group = fixture(
    (...args) => args,
    (...args) => args,
    (...args) => args,
    (...args) => args
  )
  const out = group.run()
  expect(out).toEqual({
    f1: ["test"],
    f2: ["test"],
    f3: [],
    f4: [],
  })
})

it("run args (with prependArg)", () => {
  const group = new Fn2(
    { args: ["test"], order: 1 },
    {
      f1: (...args): any[] => args,
      prependArg: { prepended: true },
    },
    { f2: (...args): any[] => args }
  )
  const out = group.run() as Record<string, any>
  expect(out.f1[0]).toEqual({ prepended: true })
  expect(out.f1[1]).toBe("test")
  expect(out.f2).toEqual(["test"])
})

it("run args (with prependOutputArg)", () => {
  const group = new Fn2(
    { args: ["test"], order: 1 },
    {
      f1: (...args): any[] => args,
      prependOutputArg: true,
    },
    { f2: (...args): any[] => args }
  )
  const out = group.run() as Record<string, any>
  expect(out.f1[0]).toEqual(out)
  expect(out.f1[1]).toBe("test")
  expect(out.f2).toEqual(["test"])
})
