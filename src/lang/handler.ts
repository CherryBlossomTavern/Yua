import Yua from 'src/client'
import fs from 'fs'
import { resolve } from 'path'
// Do dis l8tr
class LangHandler {
  private yua: Yua
  private _all: Map<string, Map<string, string>> = new Map()
  private _cache: Map<string, string> = new Map()
  private _config: { langs: string[], default: string }
  constructor(yua: Yua) {
    this.yua = yua
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
  public parseAllLang(): Promise<boolean> {
    return new Promise((resolveEnd) => {
      import(resolve(__dirname, "../../submodules/Yua-Translations/config.json")).then(r => {
        this._config = r.default
        for (const lang of this._config.langs) {
          const langg = parse(resolve(__dirname, '../../submodules/Yua-Translations/lang/' + lang + '.lang'))
          this.all.set(lang, langg)
        }
    
        resolveEnd(true)
      })
    })
  }
}

function parse(path: string): Map<string, string> {
  const fullPath = resolve(path)
  if (!path.endsWith('.lang') || !fs.existsSync(fullPath)) throw new Error(`Invalid file path: "${path}"`)
  const langFile = fs.readFileSync(fullPath).toString()
  const cleanLangFile = langFile.split(/(\n|\r\n)/).filter(item => item.length > 0)
    .filter(item => !item.replace(/\s+/, "").startsWith('#'))
    .filter(item => item !== '\n')
  const langMap = new Map()
  for (const item of cleanLangFile) {
    const keyValue = item.split(/=/)
    if (keyValue[0] && keyValue[1]) {
      langMap.set(keyValue[0].trim(), keyValue[1].trim())
    }
  }

  return langMap
}

export = LangHandler
