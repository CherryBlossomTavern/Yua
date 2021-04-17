import Yua from 'src/client'
import { parseAllInDir } from 'dotlang'
import path from 'path'
// Do dis l8tr
class LangHandler {
  private yua: Yua
  private _all: Map<string, Map<string, string>> = new Map()
  private _cache: Map<string, string> = new Map()
  private _config: { langs: string[], default: string }
  constructor(yua: Yua) {
    this.yua = yua
    this.parseAllLang()
    import(path.resolve(__dirname, "../../modules/Yua-Translations/config.json")).then(r => {
      this._config = r.default
    })
  }
  get all(): Map<string, Map<string, string>> {
    return this._all
  }
  get cache(): Map<string, string> {
    return this._cache
  }
  get config(): { langs: string[], default: string } {
    return this._config
  }
  public addLang(): void {
    null
  }
  public deleteLang(): void {
    null
  }
  public getLang(): void {
    null
  }
  public getLangValue(): void {
    null
  }
  public refreshLangs(): void {
    null
  }
  public parseLang(): void {
    null
  }
  public getLangByGuild(): void {
    null
  }
  public getValueByGuild(): void {
    null
  }
  public addGuild(): void {
    null
  }
  public removeGuild(): void {
    null
  }
  public tempGetValue(key: string): string {
    return this._all.get(this._config.default).get(key)
  }
  public parseAllLang(): void {
    const langs = parseAllInDir(path.resolve(__dirname, '../../modules/Yua-Translations/lang'))
    this._all = langs
  }
}

export = LangHandler
