import Fn2 from "./index"

export class Patch {
  Fn2: typeof Fn2 = null
  patches: Record<string, Record<string, Fn2>> = {}

  add(
    instanceId: string,
    fnId: string,
    instance: any,
    ...steps: Record<string, any>[]
  ): void {
    const p = this.patches[instanceId] || {}
    this.patches[instanceId] = p

    p[fnId] = new this.Fn2(...steps)

    instance[fnId] = (
      ...args: any[]
    ):
      | Record<string, any>
      | Promise<Record<string, any>> => {
      const out = p[fnId].run({
        args,
        id: undefined,
        fns: {},
        order: undefined,
      })
      if (out && out.then) {
        return out.then(
          (o: Record<string, any>): any => o[fnId]
        )
      } else if (out) {
        return out[fnId]
      }
    }
  }
}

export default new Patch() as Patch
