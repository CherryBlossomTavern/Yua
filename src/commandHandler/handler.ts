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
import {
  CommandProps,
  ErisPermissions, 
} from '../@types'
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
                yuaPermissions: [
                  'readMessages',
                  'sendMessages',
                  'embedLinks',
                ],
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
        quickEmbed(undefined, `**Sorry!** I could not find "${args[0]}" :c`, colors.error)

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
      quickEmbed(undefined, "Uh oh :c, it appears there is something wrong with this roleplay command!", colors.error)
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
      guildID,
    } = message
    let { content } = message

    if (author.bot) return
    if (message.channel.type !== 0) return

    const guild = this.yua.client.guilds.get(message.guildID)

    content = content.replace(/<YUA_BOT_MENTION>/, "") // Probability of this happenening is small but probably should just in case
    const args = content.split(" ")
      .filter(args => args.length > 0)

    if (!args[0]) return

    if (args[0] && args[0].replace(/!/, "") === `<@${this.yua.client.user.id}>` && !args[1]) {
      channel.createMessage(`Hi there, my name is Yua! My prefixes are: \`${prefixes.filter(item => item !== "<YUA_BOT_MENTION>").join("`, `")}\`${prefixes.includes("<YUA_BOT_MENTION>") ? `, <@${this.yua.client.user.id}>` : ""}`).catch(() => { /* Do Nothing */ })
    
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

    /**
     * Helper function for creating messages
     * 
     * Errors are caught and only thrown if NODE_ENV=development
     */
    const send = (content: string | { embed: EmbedOptions }, files?: Eris.MessageFile | Eris.MessageFile[]): Promise<Message> => {
      try {
        const message = channel.createMessage(content, files)
        message.catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            this.yua.console.error("Caught Error: CommandProps.send: This error will only show in NODE_ENV=development.\n", err)
          }
        })

        return message
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          this.yua.console.error("Caught Error: CommandProps.send: This error will only show in NODE_ENV=development.\n", err)
        }
      }
    }

    /**
     * Helper function for creating messages in specift channels
     * 
     * Errors are caught and only thrown if NODE_ENV=development
     */
    const createMessage = (channel: string, content: string | { embed: EmbedOptions }): Promise<Message> => {
      try {
        const message = this.yua.client.createMessage(channel, content)
        message.catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            this.yua.console.error("Caught Error: CommandProps.createMessage: This error will only show in NODE_ENV=development.\n", err)
          }
        })

        return message
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          this.yua.console.error("Caught Error: CommandProps.createMessage: This error will only show in NODE_ENV=development.\n", err)
        }
      }
    }

    /**
     * Helper function to create embed message
     * 
     * Errors are caught and only thrown if NODE_ENV=development
     */
    const embed = (options: EmbedOptions): Promise<Message> => {
      return send({ embed: { ...options } })
    }

    /**
     * Helper function to create quick embed
     * 
     * Errors are caught and only thrown if NODE_ENV=development
     */
    const quickEmbed = (title?: string, description?: string, color?: number): Promise<Message> => {
      return embed({
        title,
        description,
        color: color || colors.default,
      })
    }

    /**
     * Helper function to delete message that triggered command execution
     * 
     * Errors are caught and only thrown if NODE_ENV=development
     */
    const deleteMessage = (reason?: string): void => {
      message.delete(reason).catch((err) => {
        if (process.env.NODE_ENV === 'development') {
          this.yua.console.error("Caught Error: CommandProps.deleteMessage: This error will only show in NODE_ENV=development.\n", err)
        }
      })
    }

    const checkIfHasPerms = (channel: Eris.AnyGuildChannel, member: Eris.Member, permissions: ErisPermissions[]): { hasPerms: boolean, missingPerm: ErisPermissions } => {
      let hasPerms = true
      let missingPerm = undefined
      for (const perm of permissions) {
        if (member.permissions.has(perm)) {
          if (!channel.permissionsOf(member).has(perm)) {
            hasPerms = false
            missingPerm = perm
            break
          }
        } else {
          if (!channel.permissionsOf(member).has(perm)) {
            hasPerms = false
            missingPerm = perm
            break
          }
        }
      }

      return {
        hasPerms,
        missingPerm,
      }
    }

    const guildChannel = this.yua.client.guilds.get(guildID).channels.get(channel.id)
    const yuaMember = this.yua.client.guilds.get(guildID).members.get(this.yua.client.user.id)

    if (!checkIfHasPerms(guildChannel, yuaMember, ['sendMessages']).hasPerms) {
      try {
        (await message.author.getDMChannel()).createMessage("It appears I am missing the permission to send messages in **" + guild.name + "**.\nI cannot do anything without this permission, please consult someone who can change this!").catch((err) => {
          if (process.env.NODE_ENV === 'development') {
            this.yua.console.error("Caught Error: CommandHandler/checkIfHasPerms/Yua/sendMessages: This error will only show in NODE_ENV=development.\n", err)
          }
        })
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          this.yua.console.error("Caught Error: CommandHandler/checkIfHasPerms/Yua/sendMessages: This error will only show in NODE_ENV=development.\n", err)
        }
      }
      
      return
    }

    if (!checkIfHasPerms(guildChannel, yuaMember, ['embedLinks']).hasPerms) {
      send("It appears I am missing the permission to embed links in either this channel or the entire server.\nPlease enable this permission as I rely on it heavily!")

      return
    }

    if (command.extra.yuaPermissions) {
      const yuasPerms = checkIfHasPerms(guildChannel, yuaMember, command.extra.yuaPermissions)
      if (!yuasPerms.hasPerms) {
        if (yuasPerms.missingPerm !== 'viewChannel' && yuasPerms.missingPerm !== 'sendMessages' && yuasPerms.missingPerm !== 'readMessages') {
          //if (checkIfHasPerms(guildChannel, yuaMember, ['embedLinks'])) {
          quickEmbed(undefined, `Sorry, it seems I don't have **${yuasPerms.missingPerm}** permission, I cannot do that!`, colors.error)

          return
        }
      }
    }

    //console.log(this.yua.config)
    if (command.extra.devOnly && !this.yua.config.devs.includes(message.author.id)) {
      quickEmbed(undefined, "Apologies, but only my maintainers can utilize this!", colors.error)

      return
    }

    if (command.extra.userPermissions) {
      const userPerms = checkIfHasPerms(guildChannel, message.member, command.extra.userPermissions)
      if (!userPerms.hasPerms) {
        quickEmbed(undefined, `Sorry, it seems you don't have **${userPerms.missingPerm}** permission, I cannot let you do that!`, colors.error)

        return
      }
    }

    try {
      const props: CommandProps = {
        message,
        args,
        send,
        embed,
        quickEmbed,
        checkIfHasPerms,
        deleteMessage,
        guild,
        yuaMember,
        guildChannel,
        createMessage,
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
