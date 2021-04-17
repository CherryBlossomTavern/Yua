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
    this.parseAllLang()
    import(resolve(__dirname, "../../partials/Yua-Translations/config.json")).then(r => {
      this._config = r.default
      console.log(this.config)
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
    const langs = parseAllInDir(resolve(__dirname, '../../partials/Yua-Translations/lang'))
    this._all = langs
  }
}

function parse(path: string): Map<string, string> {
  const fullPath = resolve(path)
  if (!path.endsWith('.lang') || !fs.existsSync(fullPath)) throw new Error(`Invalid file path: "${path}"`)
  const langFile = fs.readFileSync(fullPath).toString()
  const cleanLangFile = langFile.split("\r\n").filter(item => item.length > 0)
    .filter(item => !item.replace(/\s+/, "").startsWith('#'))
  
  const langMap = new Map()
  for (const item of cleanLangFile) {
    const keyValue = item.split(/=/)
    langMap.set(keyValue[0].trim(), keyValue[1].trim())
  }

  return langMap
}

function parseMultiple(paths: string[]): Map<string, Map<string, string>> {
  const langMaps = new Map()
  for (const path of paths) {
    const fullPath = resolve(path)
    if (!path.endsWith('.lang') || !fs.existsSync(fullPath)) throw new Error(`Invalid file path: "${path}"`)
    const pathSplit = fullPath.split('\\')
    const result = parse(path)
    langMaps.set(pathSplit[pathSplit.length - 1].replace(/.lang/, ""), result)
  }
  
  return langMaps
}

function parseAllInDir(dir: string): Map<string, Map<string, string>> {
  function getFiles(dir: string, _files?: string[]): string[] {
    _files = _files || []
    dir = resolve(dir)
    const files = fs.readdirSync(dir)
    for (const file of files) {
      const name = resolve(dir + '/' + file)
          
      if (fs.statSync(name).isDirectory()) {
        getFiles(name, _files)
      } else if (name.endsWith('.lang')) {
        _files.push(name)
      }
    }
    
    return _files
  }
  
  return parseMultiple(getFiles(dir))
}


export = LangHandler
