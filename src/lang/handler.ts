import Yua from 'src/client'
import { parseAllInDir } from 'dotlang'
import path from 'path'
import langConfig from '../resources/Yua-Translations/config.json'
// Do dis l8tr
class LangHandler {
  private yua: Yua
  private _all: Map<string, Map<string, string>> = new Map()
  private _cache: Map<string, string> = new Map()
  constructor(yua: Yua) {
    this.yua = yua
    this.parseAllLang()
  }
  get all(): Map<string, Map<string, string>> {
    return this._all
  }
  get cache(): Map<string, string> {
    return this._cache
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
    return this._all.get(langConfig.default).get(key)
  }
  public parseAllLang(): void {
    const langs = parseAllInDir(path.resolve(__dirname, '../resources/Yua-Translations/lang'))
    this._all = langs
  }
}

export = LangHandler
