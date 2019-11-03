export const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(
  ""
)

export class Uid {
  counter = 0

  reset(): void {
    this.counter = 0
  }

  uid(): string {
    let id = this.counter
    let s: string

    this.counter += 1

    if (id === 0) {
      return ALPHABET[0]
    }

    s = ""

    while (id > 0) {
      s += ALPHABET[id % ALPHABET.length]
      id = parseInt((id / ALPHABET.length).toString(), 10)
    }

    return s
      .split("")
      .reverse()
      .join("")
  }
}

export const instance = new Uid()
export default instance.uid.bind(instance)
