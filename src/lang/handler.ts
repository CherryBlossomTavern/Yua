import Yua from '../client'
class LangHandler {
  private yua: Yua
  private _all: Map<string, Map<string, string>> = new Map()
  constructor(yua: Yua) {
    this.yua = yua
  }
  get getAll(): Map<string, Map<string, string>> {
    return this._all
  }
  public getLang(): void {
    null
  }
  public add(): void {
    null
  }
  public delete(): void {
    null
  }

}

export = LangHandler
