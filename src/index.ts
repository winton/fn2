export class Fn2 {
  run(
    memo: Record<string, any>,
    args: any[],
    ...steps: Record<string, any>[]
  ): fn2out

  run(args: any[], ...steps: Record<string, any>[]): fn2out

  run(...steps: Record<string, any>[]): fn2out

  run(
    memoOrStep?: Record<string, any>,
    argsOrStep?: any[] | Record<string, any>[],
    ...stepsOrEmpty: Record<string, any>[]
  ): fn2out {
    return this.eachStep(
      ...this.prepareArgs(
        memoOrStep,
        argsOrStep,
        stepsOrEmpty
      )
    )
  }

  eachStep(
    memo: Record<string, any>,
    args: any[],
    steps: Record<string, any>[],
    index = 0
  ): Record<string, any> {
    const promises = []
    const step = steps[index]

    if (!step) {
      return memo
    }

    for (const fnId in step) {
      const fn = step[fnId]

      if (typeof fn !== "function") {
        continue
      }

      const preArgs =
        step.args && Array.isArray(step.args)
          ? step.args
          : []

      const out = fn(...preArgs, ...args)

      if (out && out.then) {
        promises.push(
          out.then((o: any) => (memo[fnId] = o))
        )
      } else {
        memo[fnId] = out
      }
    }

    const nextStep = steps[index + 1]

    if (!nextStep && promises.length) {
      return Promise.all(promises).then(() => memo)
    }

    if (!nextStep) {
      return memo
    }

    if (promises.length) {
      return Promise.all(promises).then(() =>
        this.eachStep(memo, args, steps, index + 1)
      )
    }

    return this.eachStep(memo, args, steps, index + 1)
  }

  prepareArgs(
    memoOrStep: Record<string, any>,
    argsOrStep: any[] | Record<string, any>[],
    steps: Record<string, any>[]
  ): [Record<string, any>, any[], Record<string, any>[]] {
    let args = []
    let memo = {}

    if (Array.isArray(memoOrStep)) {
      args = memoOrStep
      steps = [argsOrStep].concat(steps)
    } else if (Array.isArray(argsOrStep)) {
      args = argsOrStep
      memo = memoOrStep
    } else {
      steps = [memoOrStep, argsOrStep].concat(steps)
    }

    steps = steps.filter(step => step)

    return [memo, args, steps]
  }
}

export type fn2out =
  | Record<string, any>
  | Promise<Record<string, any>>

export default new Fn2()
