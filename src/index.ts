function fixArgs(
  memo: Record<string, any>,
  argsOrStep: any[] | Record<string, any>[],
  steps: Record<string, any>[]
): [Record<string, any>, any[], Record<string, any>[]] {
  let args = []

  if (Array.isArray(memo)) {
    args = memo
    steps = [argsOrStep].concat(steps)
    memo = {}
  } else if (Array.isArray(argsOrStep)) {
    args = argsOrStep
  } else {
    steps = [memo, argsOrStep].concat(steps)
    memo = {}
  }

  return [memo, args, steps]
}

function eachStep(
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
    const out = fn(...args)

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
      eachStep(memo, args, steps, index + 1)
    )
  }

  return eachStep(memo, args, steps, index + 1)
}

function fn2(
  memo: Record<string, any>,
  args: any[],
  ...steps: Record<string, any>[]
): fn2Out

function fn2(
  args: any[],
  ...steps: Record<string, any>[]
): fn2Out

function fn2(...steps: Record<string, any>[]): fn2Out

function fn2(
  memo?: Record<string, any>,
  argsOrStep?: any[] | Record<string, any>[],
  ...steps: Record<string, any>[]
): fn2Out {
  return eachStep(...fixArgs(memo, argsOrStep, steps))
}

export type fn2Out =
  | Record<string, any>
  | Promise<Record<string, any>>

export default fn2
