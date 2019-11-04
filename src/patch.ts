import Fn2 from "./index"

export class Patch {
  Fn2: typeof Fn2 = null

  globals: Record<
    string,
    Record<string, Record<string, any>[]>
  > = {}

  patches: Record<string, Record<string, Fn2>> = {}

  add(
    instance: any,
    instanceId: string,
    fnId: string,
    ...steps: Record<string, any>[]
  ): void {
    const patches = this.patches[instanceId] || {}

    this.patches[instanceId] = patches

    if (patches[fnId]) {
      patches[fnId].add(...steps)
    } else {
      const globals = this.findGlobal(instanceId, fnId)

      patches[fnId] = new this.Fn2(
        ...steps,
        ...(globals || [])
      )

      instance[fnId] = (
        ...args: any[]
      ):
        | Record<string, any>
        | Promise<Record<string, any>> => {
        const outId = this.extractReturnOption(
          patches[fnId].steps
        )

        const out = patches[fnId].run(args)

        if (out && out.then) {
          return out.then(
            (o: Record<string, any>): any =>
              o[outId || fnId]
          )
        } else if (out) {
          return out[outId || fnId]
        }
      }
    }
  }

  addGlobal(
    instanceId: string,
    fnId: string,
    ...steps: Record<string, any>[]
  ): void {
    const globals = this.globals[instanceId] || {}

    this.globals[instanceId] = globals

    for (const i in this.patches) {
      if (instanceId !== "*" && i !== instanceId) {
        continue
      }
      for (const f in this.patches[i]) {
        if (fnId !== "*" && f !== fnId) {
          continue
        }
        this.patches[i][f].add(...steps)
      }
    }

    globals[fnId] = steps
  }

  findGlobal(
    instanceId: string,
    fnId: string
  ): Record<string, any>[] {
    let steps = []

    const globals = [
      this.globals["*"] && this.globals["*"]["*"],
      this.globals["*"] && this.globals["*"][fnId],
      this.globals[instanceId] &&
        this.globals[instanceId][fnId],
    ]

    for (const s of globals) {
      if (s) {
        steps = steps.concat(s)
      }
    }

    if (steps.length) {
      return steps
    }
  }

  reset(): void {
    this.globals = {}
    this.patches = {}
  }

  private extractReturnOption(
    steps: Record<string, any>[]
  ): string {
    const step = steps
      .reverse()
      .find((step: Record<string, any>) => step.return)
    if (step) {
      return step.return
    }
  }
}

export default new Patch() as Patch
