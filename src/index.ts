function fixArgs(
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

function eachStep(
  memo: Record<string, any>,
  args: any[],
  steps: Record<string, any>[],
  trace: string,
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
      step.args && Array.isArray(step.args) ? step.args : []

    const out = fn(...preArgs, ...args)

    if (out && out.then) {
      promises.push(out.then((o: any) => (memo[fnId] = o)))
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
      eachStep(memo, args, steps, trace, index + 1)
    )
  }

  return eachStep(memo, args, steps, trace, index + 1)
}

function logStart(trace: string, time: number): void {
  // eslint-disable-next-line
  console.log("🐤 Starting " + trace)
}

function logFinish(trace: string, time: number): void {
  const now = new Date().getTime()
  // eslint-disable-next-line
  console.log("🦆 Finished " + trace + ` in ${now - time} ms`)
}

function stackTrace(): string {
  const err = new Error()
  return err.stack
    .match(/^\s+at\s.+$/gm)[2]
    .replace(process.cwd() + "/", "")
    .replace(/^\s+/, "")
}

function fn2(
  memo: Record<string, any>,
  args: any[],
  ...steps: Record<string, any>[]
): fn2out

function fn2(
  args: any[],
  ...steps: Record<string, any>[]
): fn2out

function fn2(...steps: Record<string, any>[]): fn2out

function fn2(
  memoOrStep?: Record<string, any>,
  argsOrStep?: any[] | Record<string, any>[],
  ...stepsOrEmpty: Record<string, any>[]
): fn2out {
  const [memo, args, steps] = fixArgs(
    memoOrStep,
    argsOrStep,
    stepsOrEmpty
  )

  let trace: string

  if (typeof process !== "undefined" && process.env.LOG) {
    const time = new Date().getTime()
    trace = stackTrace()

    steps.unshift({
      args: [trace, time],
      logStart,
    })

    steps.push({
      args: [trace, time],
      logFinish,
    })
  }

  return eachStep(memo, args, steps, trace)
}

export type fn2out =
  | Record<string, any>
  | Promise<Record<string, any>>

export default fn2
