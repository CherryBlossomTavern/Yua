import { BaseCommand } from './struct/BaseCommand'
import Yua from '../client'
import { default as axios } from 'axios' 
import { CommandProps } from '../@types'
import { universal } from './roleplay'
class CommandHandler {
  public yua: Yua
  private _commands: Map<string, BaseCommand>
  constructor(yua: Yua) {
    this.yua = yua
  }
  get commandsArray(): BaseCommand[] {
    return Array.from(this._commands.values())
  }
  public add(command: BaseCommand): void {
    if (!this._commands.get(command.name)) {
      this._commands.set(command.name, command)
    }
  }
  public remove(command: string | BaseCommand): void {
    const name = typeof command === 'string' ? command : command.name
    this._commands.delete(name)
  }
  public get(command: string | BaseCommand): BaseCommand {
    const name = typeof command === 'string' ? command : command.name

    return this._commands.get(name) || undefined
  }
  public filter(filter: (val: BaseCommand) => boolean): Map<string, BaseCommand> {
    const results = new Map()
    for (const [k, v] of this._commands.entries()) {
      if (filter(v)) {
        results.set(k, v)
      }
    }
    
    return results
  }
  public async autoRegisterAll(): Promise<boolean> {
    return true
  }
  public async refreshRolePlay(): Promise<boolean> {
    return new Promise((resolve) => {
      // TEMP
      const SheetID = "1EWmNQ7KeN7xDvYjCQMZecLa84Kz3bF7uILnZ9aNaQQw"

      axios({
        method: 'get',
        url: 'https://api.fureweb.com/spreadsheets/' + SheetID,
      }).then(res => {
        const data = res.data.data
        if (!data[0]) return resolve(false)

        const roleplayCommands = Array.from(this.filter(c => c.extra.category === 'roleplay').keys())
        if (roleplayCommands[0]) {
          for (const name of roleplayCommands) {
            this.remove(name)
          }
        }

        interface ActionInterface {
          Command: string
          Description: string
          Response: string
          [key: string]: string
        }

        for (const action of data) {
          const typedAction: ActionInterface = action
          const name:string = typedAction.Command.toLowerCase()
          const description:string = typedAction.Description
          const response:string = typedAction.Response
          const type:number = response.includes("%RECIEVER%") ? (response.includes("|") ? 3 : 2) : 1
          const links: string[] = Object.values(typedAction).filter((item: string) => item.includes("https://"))

          this._commands.set(
            name, new (
              class YuaActionCommand extends BaseCommand {
                private yua: Yua
                constructor(yua: Yua) {
                  super(name, {
                    usage: type === 3 ? "[user] [reason]" : (type === 2 ? "<user> [reason]" : "[reason]"),
                    description: description,
                    category: "roleplay",
                    aliases: [],
                    permissions: [], // Not Yet Implemented
                    type: 'all', // Not Yet Implemented
                  })
                  this.yua = yua
                }
                public execute(props: CommandProps): void {
                  universal({
                    name: name,
                    description: description,
                    response: response,
                    type: type,
                    links: links,
                  }, props)
                }
              }
            )(this.yua),
          )
        }

      })
        .catch(err => {
          throw err
        })
    })
  }
}

export = CommandHandler
