/* eslint-disable @typescript-eslint/ban-ts-comment */
import Eris, {
  Member,
  Message,
  EmbedOptions,
} from 'eris'

import {
  colors,
  prefixRegEXP,
  prefixes,
} from '../config'

import {
  RoleplayCounter,
} from '../database/models'

import path from 'path'
import { readdirSync } from 'fs'
import { BaseCommand } from './'
import Yua from 'src/client'
import { CommandProps } from '../@types'
import Template from './template/template/command'

interface RPCommandJson {
  name: string
  description: string
  links: string[]
  aliases: string[]
  "responses.self"?: string
  "responses.towards"?: string
  "responses.want"?: string
  "counters.self"?: string
  "counters.towards"?: string
  "counters.want"?: string
}

interface YuaRpCommand extends BaseCommand {
  json: RPCommandJson
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
  get categories(): string[] {
    return [...new Set(this.commandsArray.map(c => c.extra.category))].sort()
  }
  /**
   * Add command
   */
  public add(command: BaseCommand): void {
    if (!this._commands.get(command.name)) {
      this._commands.set(command.name, command)
      this.yua.console.debug(`Registered Command: ${command.name}`)
    }
  }
  /**
   * Remove command
   */
  public remove(command: string | BaseCommand): void {
    const name = typeof command === 'string' ? command : command.name
    this._commands.delete(name)
    this.yua.console.debug(`Unregistered Command: ${typeof command === 'string' ? command : command.name}`)
  }
  /**
   * Get command
   */
  public get(command: string | BaseCommand): BaseCommand {
    const name = typeof command === 'string' ? command : command.name

    return this._commands.get(name) || null
  }
  /**
   * Get command by alias or name
   */
  public getByAlias(command: string): BaseCommand {
    const cmd = Array.from(this.filter((c) => c.name === command || c.extra.aliases.includes(command)).values())
    if (cmd[0]) return cmd[0]
    else return null
  }
  /**
   * Filter commands
   */
  public filter(filter: (val: BaseCommand) => boolean): Map<string, BaseCommand> {
    const results = new Map()
    for (const [k, v] of this._commands.entries()) {
      if (filter(v)) {
        results.set(k, v)
      }
    }
    
    return results
  }
  /**
   * Parses command directory and registers all commands
   */
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
    const rpResp = await this.registerRolePlay()
    if (!rpResp) {
      this.yua.console.error(`Roleplay Commands Failed To Register`)
    }

    return true
  }
  /**
   * Parses roleplay submodule directory and registers all commands
   */
  public async registerRolePlay(): Promise<boolean> {
    const commandFiles = readdirSync(path.resolve(__dirname, '../../submodules/Yua-Roleplay/commands')).filter(file => file.endsWith('.json'))
    for (const command of commandFiles) {
      const rpCommand: RPCommandJson = await import(path.resolve(__dirname, `../../submodules/Yua-Roleplay/commands/${command}`))
      let type: "self" | "towards" | "both" = 'both'
      if (rpCommand['responses.self'] && !rpCommand['responses.towards']) type = 'self'
      else if (!rpCommand['responses.self'] && rpCommand['responses.towards']) type = 'towards'
      const sendRoleplay = this.sendRoleplay
      this.add(
        new (
          class YuaRpCommand extends BaseCommand {
            private yua: Yua
            public json: RPCommandJson = rpCommand
            constructor(yua: Yua) {
              super(rpCommand.name, {
                description: rpCommand.description,
                usage: type === 'both' ? "[user] [reason]" : (type === 'towards' ? "<user> [reason]" : "[reason]"),
                category: 'roleplay',
                aliases: rpCommand.aliases,
              })
              this.yua = yua
            }
            public execute(props: CommandProps): void {
              sendRoleplay(this, props, this.yua, type)
            }
          }
        )(this.yua),
      )
    }

    return true
  }
  /**
   * Sends roleplay response
   */
  public async sendRoleplay(cmd: YuaRpCommand, props: CommandProps, yua: Yua, type: "self" | "towards" | "both"): Promise<void> {
    const {
      message,
      args,
      embed,
      quickEmbed,
    } = props
    const self = async (): Promise<void> => {
      try {
        const gif = cmd.json.links[Math.floor(Math.random() * cmd.json.links.length)]
        //console.log(gif)
        const response = yua.langHandler.tempGetValue(cmd.json['responses.self'])
        const counter = yua.langHandler.tempGetValue(cmd.json['counters.self'])
        if (!response || !counter) return somethingWrong()

        let sender = await RoleplayCounter.findOne({ userId: message.author.id })
        if (!sender) {
          sender = await RoleplayCounter.create({
            userId: message.author.id,
            roleplay: {},
          })
        }
        if (!sender.roleplay) sender.roleplay = {}
        if (!sender.roleplay[cmd.name]) {
          sender.roleplay = Object.assign(sender.roleplay, {
            [cmd.name]: {
              sent: 0,
              recieved: 0,
              want: 0,
            },
          })
        }
        sender.roleplay[cmd.name].sent += 1

        embed({
          color: colors.default,
          description: `${response.replace("%s", message.member.nick || message.member.username)}\n${args[0] ? ` *"${args.join(" ").replace(/\*/g, "")}"*` : ""}`,
          image: {
            url: gif,
          },
          footer: {
            text: `${counter.replace("%s", message.member.nick || message.member.username).replace("%s", sender.roleplay[cmd.name].sent.toString())}`,
          },
        })

        await sender.updateOne({ roleplay: sender.roleplay })

        return
      } catch (err) {}

    }
    const towards = async (): Promise<void> => {
      try {
        if (!args[0]) return want()
        const user = await getUser()
        if (!user) throw "No User"
        args.shift()

        if (message.member.id === user.id) {
          if (type === 'both') {
            self()

            return
          }

          return want()
        }

        const gif = cmd.json.links[Math.floor(Math.random() * cmd.json.links.length)]
        //console.log(gif)
        const response = yua.langHandler.tempGetValue(cmd.json['responses.towards'])
        const counter = yua.langHandler.tempGetValue(cmd.json['counters.towards'])
        if (!response || !counter) return somethingWrong()

        let sender = await RoleplayCounter.findOne({ userId: message.author.id })
        let reciever = await RoleplayCounter.findOne({ userId: user.id })
        if (!sender) {
          sender = await RoleplayCounter.create({
            userId: message.author.id,
            roleplay: {},
          })
        }
        if (!reciever) {
          reciever = await RoleplayCounter.create({
            userId: user.id,
            roleplay: {},
          })
        }
        if (!sender.roleplay) sender.roleplay = {}
        if (!reciever.roleplay) reciever.roleplay = {}
        if (!sender.roleplay[cmd.name]) {
          sender.roleplay = Object.assign(sender.roleplay, {
            [cmd.name]: {
              sent: 0,
              recieved: 0,
              want: 0,
            },
          })
        }
        if (!reciever.roleplay[cmd.name]) {
          reciever.roleplay = Object.assign(reciever.roleplay, {
            [cmd.name]: {
              sent: 0,
              recieved: 0,
              want: 0,
            },
          })
        }
        sender.roleplay[cmd.name].sent += 1
        reciever.roleplay[cmd.name].recieved += 1

        embed({
          color: colors.default,
          description: `${response.replace("%s", message.member.nick || message.member.username).replace("%s", user.nick || user.username)}\n${args[0] ? ` *"${args.join(" ").replace(/\*/g, "")}"*` : ""}`,
          image: {
            url: gif,
          },
          footer: {
            text: `${counter
              .replace("%s", user.nick || user.username)
              .replace("%s", reciever.roleplay[cmd.name].recieved.toString())
              .replace("%s", message.member.nick || message.member.username)
              .replace("%s", sender.roleplay[cmd.name].sent.toString())}`,
          },
        })

        await sender.updateOne({ roleplay: sender.roleplay })
        await reciever.updateOne({ roleplay: reciever.roleplay })

        return
      } catch (err) {
        quickEmbed(null, `**Sorry!** I could not find "${args[0]}" :c`, colors.error)

        return
      }
    }
    const want = (): void => {
      RoleplayCounter.findOne({ userId: message.author.id })
        .then(async (doc) => {
          if (!doc) {
            doc = await RoleplayCounter.create({
              userId: message.author.id,
              roleplay: {},
            })
          }
          if (!doc.roleplay) doc.roleplay = {}
          if (!doc.roleplay[cmd.name]) {
            doc.roleplay = Object.assign(doc.roleplay, {
              [cmd.name]: {
                sent: 0,
                recieved: 0,
                want: 0,
              },
            })
          }
          doc.roleplay[cmd.name].want += 1
          const sadCmd: YuaRpCommand = yua.commandHandler.get("sad") as YuaRpCommand

          const gif = sadCmd.json.links[Math.floor(Math.random() * sadCmd.json.links.length)]

          const counter = yua.langHandler.tempGetValue(cmd.json['counters.want'])
          const response = yua.langHandler.tempGetValue(cmd.json['responses.want'])
          if (!counter || !response) return somethingWrong()
          embed({
            color: colors.default,
            description: `${response.replace("%s", message.member.nick || message.member.username)}`,
            image: {
              url: gif,
            },
            footer: {
              text: `${counter.replace("%s", message.member.nick || message.member.username).replace("%s", doc.roleplay[cmd.name].want.toString())}`,
            },
          })
          await doc.updateOne({ roleplay: doc.roleplay })
        })
        .catch(() => {
          const sadCmd: YuaRpCommand = yua.commandHandler.get("sad") as YuaRpCommand

          const gif = sadCmd.json.links[Math.floor(Math.random() * sadCmd.json.links.length)]

          const response = yua.langHandler.tempGetValue(cmd.json['responses.want'])
          embed({
            color: colors.default,
            description: `${response.replace("%s", message.member.nick || message.member.username)}`,
            image: {
              url: gif,
            },
          })
        })
    }
    const somethingWrong = (): void => {
      quickEmbed(null, "Uh oh :c, it appears there is something wrong with this roleplay command!", colors.error)
    }
    const getUser = async (): Promise<Member> => {
      try {
        if (!args[0]) return null
        const guild = yua.client.guilds.get(props.message.guildID)
        let user: Eris.Member
        if (message.mentions[0]) {
          user = guild.members.get(message.mentions[0].id)
        } else {
          user =
          guild.members.get(args[0]) ||
          guild.members.find(({ username }) => username === args[0]) ||
          (await guild.fetchMembers({
            query: args[0],
            limit: 1,
          }))[0]
          if (!user && parseInt(args[0])) {
            user = (await guild.fetchMembers({
              userIDs: [],
            }))[0]
          }
        }
        if (!user) {
          return null
        } else {

          return user
        }
      } catch (err) {

        return null
      }
    }
    switch(type) {
    case 'self':
      self()
      break
    case 'towards':
      towards()
      break
    case 'both':
      const user = await getUser()
      if (user) towards()
      else self()
      break
    }
  }
  /**
   * Parses message for command
   */
  public async parseCommand(message: Message): Promise<void> {
    const {
      author,
      channel,
    } = message
    let { content } = message

    if (author.bot) return
    if (message.channel.type !== 0) return

    content = content.replace(/<YUA_BOT_MENTION>/, "") // Probability of this happenening is small but probably should just in case
    const args = content.split(" ")
      .filter(args => args.length > 0)

    if (!args[0]) return

    if (args[0] && args[0].replace(/!/, "") === `<@${this.yua.client.user.id}>` && !args[1]) {
      channel.createMessage(`Hi there, my name is Yua! My prefixes are: \`${prefixes.filter(item => item !== "<YUA_BOT_MENTION>").join("`, `")}\`${prefixes.includes("<YUA_BOT_MENTION>") ? `, <@${this.yua.client.user.id}>` : ""}`)
    
      return
    }

    if (!prefixRegEXP.test(
      content
        .toLowerCase()
        .replace(`<@${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>")
        .replace(`<@!${this.yua.client.user.id}>`, "<YUA_BOT_MENTION>"),
    )) return // If Content Does Not Include Prefix
    args[0] = args[0]
      .toLowerCase()
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
    //console.log(this.yua.config)
    if (command.extra.devOnly && !this.yua.config.devs.includes(message.author.id)) {
      quickEmbed(null, "Apologies, but only my maintainers can utilize this!", colors.error)

      return
    }

    if (command.extra.permissions) {
      let hasPerms = true
      let missingPerm = undefined
      for (const perm of command.extra.permissions) {
        if (!message.member.permissions.has(perm)) {
          hasPerms = false
          missingPerm = perm
          break
        }
      }
      if (!hasPerms) {
        quickEmbed(null, `Sorry, it seems you don't have **${missingPerm}** permission, I cannot let you do that!`, colors.error)

        return
      }
    }

    const guild = this.yua.client.guilds.get(message.guildID)

    try {
      const props: CommandProps = {
        message,
        args,
        send,
        embed,
        quickEmbed,
        guild,
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
