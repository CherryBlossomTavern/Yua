/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Member,
  Message,
  EmbedOptions,
} from 'eris'

import {
  colors,
  prefixRegEXP,
  prefixes,
} from '../config'

import path from 'path'
import { readdirSync } from 'fs'
import { BaseCommand } from './base/BaseCommand'
import Yua from '../client'
import { default as axios } from 'axios' 
import { CommandProps } from '../@types'
import Template from './template/template/command'

interface RPCommand {
  name: string
  description: string
  response: string
  type: number
  links: string[]
}

class CommandHandler {
  private yua: Yua
  private _commands: Map<string, BaseCommand> = new Map()
  constructor(yua: Yua) {
    this.yua = yua
  }
  get commandsArray(): BaseCommand[] {
    return Array.from(this._commands.values())
  }
  public add(command: BaseCommand): void {
    if (!this._commands.get(command.name)) {
      this._commands.set(command.name, command)
      this.yua.console.debug(`Registered Command: ${command.name}`)
    }
  }
  public remove(command: string | BaseCommand): void {
    const name = typeof command === 'string' ? command : command.name
    this._commands.delete(name)
    this.yua.console.debug(`Unregistered Command: ${typeof command === 'string' ? command : command.name}`)
  }
  public get(command: string | BaseCommand): BaseCommand {
    const name = typeof command === 'string' ? command : command.name

    return this._commands.get(name) || null
  }
  public getByAlias(command: string): BaseCommand {
    const cmd = Array.from(this.filter((c) => c.name === command || c.extra.aliases.includes(command)).values())
    if (cmd[0]) return cmd[0]
    else return null
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
    readdirSync(path.resolve(__dirname, './commands')).forEach(async dir => {
      const commandFiles = readdirSync(path.resolve(__dirname, `./commands/${dir}/`)).filter(file => file.endsWith(`${process.env.NODE_ENV === 'production' ? ".js" : ".ts"}`))
      for (const file of commandFiles) {
        let commandImport: typeof Template = await import(path.resolve(__dirname, `./commands/${dir}/${file}`))
        // @ts-expect-error
        commandImport = commandImport.default ? commandImport.default : commandImport
        const command = new commandImport(this.yua)
        if (command.name) {
          this.add(command)
        } else this.yua.console.warn(`${file} does not include a name prop, cannot be executed`)
      }
    })
    const rpResp = await this.refreshRolePlay()
    if (!rpResp) {
      this.yua.console.error(`Roleplay Commands Failed To Register`)
    }

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

        interface RoleplayInterface {
          Command: string
          Description: string
          Response: string
          [key: string]: string
        }

        for (const roleplay of data) {
          const typedRoleplay: RoleplayInterface = roleplay
          const name:string = typedRoleplay.Command.toLowerCase()
          const description:string = typedRoleplay.Description
          const response:string = typedRoleplay.Response
          const type:number = response.includes("%RECIEVER%") ? (response.includes("|") ? 3 : 2) : 1
          const links: string[] = Object.values(typedRoleplay).filter((item: string) => item.includes("https://"))
          const sendRoleplay = this.sendRoleplay
          this.add(
            new (
              class YuaRoleplayCommand extends BaseCommand {
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
                  sendRoleplay({
                    name: name,
                    description: description,
                    response: response,
                    type: type,
                    links: links,
                  }, props, this.yua)
                }
              }
            )(this.yua),
          )
        }
        resolve(true)
      })
        .catch(err => {
          throw err
        })
    })
  }
  public async sendRoleplay(rpCommand: RPCommand, props: CommandProps, yua: Yua): Promise<void> {
    const {
      message,
      args,
      embed,
      quickEmbed,
    } = props
    const self = (): void => {
      try {
        const gif = rpCommand.links[Math.floor(Math.random() * rpCommand.links.length)]

        let response = rpCommand.response

        if (rpCommand.type === 3) {
          response = response.split("|").filter(i => !i.includes("%RECIEVER%"))[0]
        }
        if (!response) {
          quickEmbed(null, "Uh oh :c, it appears there is something wrong with this roleplay command!", colors.error)

          return
        }

        embed({
          color: colors.default,
          description: `${response.replace(/%SENDER%/g, message.member.nick || message.member.username)}\n${args[0] ? ` *"${args.join(" ").replace(/\*/g, "")}"*` : ""}`,
          image: {
            url: gif,
          },
        })

        return
      } catch (err) {}

    }
    const towards = async (): Promise<void> => {
      try {
        if (!args[0]) {
          quickEmbed(null, `**Sorry!** I need you to tell me who you want to ${rpCommand.name} first!`)

          return
        }
        const user = await getUser()
        if (!user) throw "No User"
        args.shift()

        const gif = rpCommand.links[Math.floor(Math.random() * rpCommand.links.length)]

        let response = rpCommand.response

        if (rpCommand.type === 3) {
          response = response.split("|").filter(i => i.includes("%RECIEVER%"))[0]
        }

        if (!response) {
          quickEmbed(null, "Uh oh :c, it appears there is something wrong with this roleplay command!", colors.error)

          return
        }

        embed({
          color: colors.default,
          description: `${response.replace(/%SENDER%/g, message.member.nick || message.member.username).replace(/%RECIEVER%/g, user.nick || user.username)}\n${args[0] ? ` *"${args.join(" ").replace(/\*/g, "")}"*` : ""}`,
          image: {
            url: gif,
          },
        })

        return
      } catch (err) {
        quickEmbed(null, `**Sorry!** I could not find "${args[0]}" :c`, colors.error)

        return
      }
    }
    const getUser = async (): Promise<Member> => {
      try {
        const guild = yua.client.guilds.get(props.message.guildID)
        const user =
          guild.members.get(message.mentions[0]?.id) ||
          guild.members.get(args[0]) ||
          guild.members.find(({ username }) => username === args[0]) ||
          (await guild.fetchMembers({
            query: args[0],
            limit: 1,
          }))[0] ||
          (await guild.fetchMembers({
            userIDs: [args[0]],
          }))[0]
        if (!user) {
          return null
        } else {

          return user
        }
      } catch (err) {

        return null
      }
    }

    switch(rpCommand.type) {
    case 1:
      self()
      break
    case 2:
      towards()
      break
    case 3:
      const user = await getUser()
      if (user) towards()
      else self()
      break
    }
  }
  public async parseCommand(message: Message): Promise<void> {
    const {
      author,
      channel,
    } = message
    let { content } = message

    if (author.bot) return

    content = content.replace(/<YUA_BOT_MENTION>/, "") // Probability of this happenening is small but probably should just in case
    const args = content.split(" ")
      .filter(args => args.length > 0)

    if (!args[0]) return

    if (args[0] && args[0].replace(/!/, "") === `<@${this.yua.client.user.id}>` && !args[1]) {
      channel.createMessage(`Hi there, my name is Yua! My prefixes are: \`${prefixes.filter(item => item !== "<YUA_BOT_MENTION>").join("`, `")}\`${prefixes.includes("<YUA_BOT_MENTION>") ? `, <@${this.yua.client.user.id}>` : ""}`)
    
      return
    }

    if (!prefixRegEXP.test(content.replace(`<@${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>").replace(`<@!${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>"))) return // If Content Does Not Include Prefix
    args[0] = args[0]
      .replace(`<@!${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>")
      .replace(`<@${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>")
      .replace(prefixRegEXP, "")

    if (args[0].length === 0) args.shift() // Remove Prefix From Args

    if (!args[0]) return // No Command
    
    const command = this.getByAlias(args[0].toLowerCase())
    if (!command) return
    args.shift() // Remove Command From Args Array

    const send = (content: string | { embed: EmbedOptions }): Promise<Message> => {
      return channel.createMessage(content)
    }

    const embed = (options: EmbedOptions): Promise<Message> => {
      return send({ embed: { ...options } })
    }

    const quickEmbed = (title?: string, description?: string, color?: number): Promise<Message> => {
      return embed({
        title,
        description,
        color: color || colors.default,
      })
    }

    try {
      const props: CommandProps = {
        message,
        args,
        send,
        embed,
        quickEmbed,
      }

      await command.execute(props)

      return
    } catch (err) {
      this.yua.console.error(err)

      send({
        embed: {
          color: colors.error,
          title: "An Ewwor Has Occuwer",
          description: `\`\`\`${err}\`\`\``,
        },
      })

      return
    }

  }
}

export = CommandHandler
