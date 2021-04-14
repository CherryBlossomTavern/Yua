import Yua from '../client'
// Do dis l8tr
class LangHandler {
  private yua: Yua
  private _all: Map<string, Map<string, string>> = new Map()
  constructor(yua: Yua) {
    this.yua = yua
  }
  get getAll(): Map<string, Map<string, string>> {
    return this._all
  }
  public get(): void {
    null
  }
  public add(): void {
    null
  }
  public delete(): void {
    null
  }
  public getLang(): void {
    null
  }
  public refresh(): void {
    null
  }
  public parse(): void {
    null
  }
}

export = LangHandler
