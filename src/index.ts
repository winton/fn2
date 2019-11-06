import uid from "./uid"

export interface Fn2Step {
  args: any[]
  id: string
  fns: Record<string, Function>
  prependArg: any
  prependOutputArg: true
  order: number
  return: string
}

export type Fn2Out =
  | Record<string, any>
  | Promise<Record<string, any>>

export default class Fn2 {
  steps: Fn2Step[] = []

  constructor(...steps: Record<string, any>[]) {
    this.add(...steps)
  }

  add(...steps: Record<string, any>[]): void {
    let args: any[]
    let order: number

    for (const item of steps) {
      const step = this.prepareStep(args, order, item)
      const { args: a, order: o } = step

      args = typeof a === "undefined" ? args : a
      order = typeof o === "undefined" ? order : o

      if (step.fns) {
        this.steps = this.steps.concat(step)
      }
    }
  }

  run(
    args: any[] = [],
    id?: string,
    output?: Record<string, any>
  ): Fn2Out {
    output = output || {}

    let index: number
    const steps = this.steps.sort(this.stepSort)

    if (!id) {
      index = 0
    } else {
      index = steps.findIndex(step => step.id === id)
    }

    const step = steps[index]
    const promises = []

    if (!step) {
      return output
    }

    for (const fnId in step.fns) {
      const fn = step.fns[fnId]
      const out = fn(
        ...(step.prependArg ? [step.prependArg] : []),
        ...(step.prependOutputArg ? [output] : []),
        ...(step.args || args)
      )

      if (out && out.then) {
        promises.push(
          out.then((o: any) => (output[fnId] = o))
        )
      } else {
        output[fnId] = out
      }
    }

    const nextStep = steps[index + 1]

    if (!nextStep && promises.length) {
      return Promise.all(promises).then(() => output)
    }

    if (!nextStep) {
      return output
    }

    if (promises.length) {
      return Promise.all(promises).then(() =>
        this.run(args, nextStep.id, output)
      )
    }

    return this.run(args, nextStep.id, output)
  }

  private prepareStep(
    args: any[],
    order: number,
    item: Record<string, any>
  ): Fn2Step {
    let addedFn = false

    const step: Fn2Step = {
      args,
      id: undefined,
      fns: {},
      order,
      prependArg: undefined,
      prependOutputArg: undefined,
      return: undefined,
    }

    const copyKeys = [
      "args",
      "prependArg",
      "prependOutputArg",
      "return",
    ]

    for (const key in item) {
      if (copyKeys.indexOf(key) > -1) {
        step[key] = item[key]
      } else if (key === "order") {
        step.order = item.order - 1
      } else {
        addedFn = true
        step.fns[key] = item[key]
        step.order = (step.order || 0) + 1
      }
    }

    if (addedFn) {
      step.id = uid()
    } else {
      step.fns = undefined
    }

    return step
  }

  private stepSort(
    { order: a }: Fn2Step,
    { order: b }: Fn2Step
  ): number {
    return a > b ? 1 : a < b ? -1 : 0
  }
}
