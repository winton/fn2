import Fn2 from "./index"

export class Patch {
  Fn2: typeof Fn2 = null
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
      patches[fnId] = new this.Fn2(...steps)

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

  reset(): void {
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
