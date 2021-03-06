/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { Menu } from '../../../classes'
import Eris from 'eris'
import { ReactionRole } from '../../../database/models'
import {
  colors, CountryFlags, 
} from '../../../config'
import { getEmbedJson } from '../../../utils'
class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("rrcreate", {
      usage: "[type]",
      description: "Create a new reaction role menu with my step by step setup!\nUse https://embedbuilder.yua.gg/ to create your embed!",
      category: "reaction-roles",
      aliases: [
        'rrc',
        'reactionrolecreate',
      ],
      userPermissions: [
        'manageRoles',
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
        'manageMessages',
        'addReactions',
        'manageRoles',
      ],
      type: 'all',
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      message,
      args,
      quickEmbed,
    } = props

    const switchType = (type: "add" | "remove" | "unique" | "binding" | "limited"): void => {
      switch (type) {
      case 'add':
        this._handleMenuTypeAdd(props)
        break
      case 'remove':
        this._handleMenuTypeRemove(props)
        break
      case 'binding':
        this._handleMenuTypeBinding(props)
        break
      case 'limited':
        this._handleMenuTypeLimited(props)
        break
      case 'unique':
        this._handleMenuTypeUnique(props)
        break
      }
    }

    if (!args[0]) {
      const addEmoji: Eris.Emoji = {
        animated: false,
        name: "RRadd",
        id: "846179620730044457",
        require_colons: false,
        managed: false,
        roles: [],
        user: null,
      }
      const removeEmoji: Eris.Emoji = {
        animated: false,
        name: "RRremove",
        id: "846179620440506399",
        require_colons: false,
        managed: false,
        roles: [],
        user: null,
      }
      const uniqueEmoji: Eris.Emoji = {
        animated: false,
        name: "RRUnique",
        id: "846180587093360652",
        require_colons: false,
        managed: false,
        roles: [],
        user: null,
      }
      const bindingEmoji: Eris.Emoji = {
        animated: false,
        name: "RRBinding",
        id: "846182159483928617",
        require_colons: false,
        managed: false,
        roles: [],
        user: null,
      }
      const limitedEmoji: Eris.Emoji = {
        animated: false,
        name: "RRLimited",
        id: "846184576694616074",
        require_colons: false,
        managed: false,
        roles: [],
        user: null,
      }
      // const addEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846179620730044457'), // Add
      //   removeEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846179620440506399'), // Remove
      //   uniqueEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846180587093360652'), // Unique
      //   bindingEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846182159483928617'), // Binding
      //   limitedEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846184576694616074') // Limited

      const emojiToType = new Map<string,"add"|"remove"|"unique"|"binding"|"limited">([
        ['846179620730044457', 'add'],
        ['846179620440506399', 'remove'],
        ['846180587093360652', 'unique'],
        ['846182159483928617', 'binding'],
        ['846184576694616074', 'limited'],
      ])

      const rr = new Menu<[Eris.Emoji]>(this.yua, {
        purgeAllWhenDone: true,
        collectorTimeout: 200000,
      })

      rr.addReactionQuestion({
        content: {
          embed: {
            "color": 16772525,
            "title": "Reaction Role Menu Type",
            "description": "Type `cancel` at any time to stop the reaction role creation process",
            "fields": [
              {
                "name": "<:RRadd:846179620730044457> Add",
                "value": "Reacting will give the user any or all roles in this menu. Removing the reaction will remove the role.",
                "inline": true,
              },
              {
                "name": "<:RRremove:846179620440506399> Remove",
                "value": " Reacting will take away the selected roles. Roles can only be removed, not added.",
                "inline": true,
              },
              {
                "name": "<:RRUnique:846180587093360652> Unique",
                "value": "Users can only hold one role in the menu at a time.",
                "inline": true,
              },
              {
                "name": "<:RRBinding:846182159483928617> Binding",
                "value": "Reacting will result in a role being added to the user that cannot be removed by the same menu. ",
                "inline": true,
              },
              {
                "name": "<:RRLimited:846184576694616074> Limited",
                "value": "User can react and receive only a certain amount of roles set by the person creating the role menu.",
                "inline": true,
              },
            ],
          },
        },
        reactions: [
          addEmoji,
          removeEmoji,
          uniqueEmoji,
          bindingEmoji,
          limitedEmoji,
        ],
      })
      rr.once('end', (collected, reason) => {
        if (this._handleCollectorEnd(props, reason)) {
          switchType(emojiToType.get(collected[0].id))
        }
      })

      rr.start(message)
    } else {
      if (/(add|remove|unique|binding|limited)/.test(args[0].toLowerCase())) {
        switchType(args[0] as "add" | "remove" | "unique" | "binding" | "limited")
      } else {
        quickEmbed(undefined, `Sorry, but \`${args[0]}\` is not a valid menu type. Maybe just try using \`yua rrcreate\``, colors.error)
        
        return
      }
    }

    return
  }
  private _handleMenuTypeAdd(props: CommandProps): void {
    const menu = new Menu<[Eris.Message, Eris.Message, Eris.Message]>(this.yua, {
      purgeAllWhenDone: true,
      collectorTimeout: 300000,
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now for the reaction role menu message. Please specify either normal content for me to say or create an embed using [my embed creator](https://embedbuilder.yua.gg/)\n\n*type `cancel` at any time to stop the reaction role creation process*",
        },
      },
      callback: async (msg) => {
        return this._menuContentLogic(props, msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the next thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```???? @thumbsUpRole ???? @thumbsDownRole ...```",
        },
      },
      callback: (msg) => {
        return this._emojiRoleLogic(msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Yay, you are almost there! The last thing I need to know is where you would like me to put the menu.\n\nPlease mention a channel like so: `#channel-name`",
        },
      },
      callback: (msg) => {
        return this._validateChannel(props, msg)
      },
    })

    menu.once('end', async (collected, reason) => {
      if (this._handleCollectorEnd(props, reason)) {
        const extracted = this._extractEmojiRolePairs(collected[1])
        const channel = collected[2].channelMentions[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any = collected[0].content
        try {
          content = await getEmbedJson(collected[0], collected[0].content)
        } catch {}

        props.createMessage(channel, content)
          .then((m) => {
            //console.log(extracted.emojisToAddToEmbed)
            for (const emoji of extracted.emojisToAddToEmbed) {
              try {
                m.addReaction(emoji).catch(() => { /* Do Nothing */ })
              } catch (error) {
                
              }
            }
            ReactionRole.create({
              guildId: props.guild.id,
              channelId: channel,
              messageId: m.id,
              type: 'add',
              roles: extracted.roles,
              limit: 0,
            })
              .catch(() => {
                props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
              })
          })
          .catch(() => {
            props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
          })
        props.deleteMessage()
      }
    })

    menu.start(props.message)
  }
  private _handleMenuTypeRemove(props: CommandProps): void {
    const menu = new Menu<[Eris.Message, Eris.Message, Eris.Message]>(this.yua, {
      purgeAllWhenDone: true,
      collectorTimeout: 300000,
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now for the reaction role menu message. Please specify either normal content for me to say or create an embed using [my embed creator](https://embedbuilder.yua.gg/)\n\n*type `cancel` at any time to stop the reaction role creation process*",
        },
      },
      callback: async (msg) => {
        return this._menuContentLogic(props, msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the next thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```???? @thumbsUpRole ???? @thumbsDownRole ...```",
        },
      },
      callback: (msg) => {
        return this._emojiRoleLogic(msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Yay, you are almost there! The last thing I need to know is where you would like me to put the menu.\n\nPlease mention a channel like so: `#channel-name`",
        },
      },
      callback: (msg) => {
        return this._validateChannel(props, msg)
      },
    })

    menu.once('end', async (collected, reason) => {
      if (this._handleCollectorEnd(props, reason)) {
        const extracted = this._extractEmojiRolePairs(collected[1])
        const channel = collected[2].channelMentions[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any = collected[0].content
        try {
          content = await getEmbedJson(collected[0], collected[0].content)
        } catch {}

        props.createMessage(channel, content)
          .then((m) => {
            //console.log(extracted.emojisToAddToEmbed)
            for (const emoji of extracted.emojisToAddToEmbed) {
              try {
                m.addReaction(emoji).catch(() => { /* Do Nothing */ })
              } catch (error) {
                
              }
            }
            ReactionRole.create({
              guildId: props.guild.id,
              channelId: channel,
              messageId: m.id,
              type: 'remove',
              roles: extracted.roles,
              limit: 0,
            })
              .catch(() => {
                props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
              })
          })
          .catch(() => {
            props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
          })
        props.deleteMessage()
      }
    })

    menu.start(props.message)
  }
  private _handleMenuTypeUnique(props: CommandProps): void {
    const menu = new Menu<[Eris.Message, Eris.Message, Eris.Message]>(this.yua, {
      purgeAllWhenDone: true,
      collectorTimeout: 300000,
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now for the reaction role menu message. Please specify either normal content for me to say or create an embed using [my embed creator](https://embedbuilder.yua.gg/)\n\n*type `cancel` at any time to stop the reaction role creation process*",
        },
      },
      callback: async (msg) => {
        return this._menuContentLogic(props, msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the next thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```???? @thumbsUpRole ???? @thumbsDownRole ...```",
        },
      },
      callback: (msg) => {
        return this._emojiRoleLogic(msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Yay, you are almost there! The last thing I need to know is where you would like me to put the menu.\n\nPlease mention a channel like so: `#channel-name`",
        },
      },
      callback: (msg) => {
        return this._validateChannel(props, msg)
      },
    })

    menu.once('end', async (collected, reason) => {
      if (this._handleCollectorEnd(props, reason)) {
        const extracted = this._extractEmojiRolePairs(collected[1])
        const channel = collected[2].channelMentions[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any = collected[0].content
        try {
          content = await getEmbedJson(collected[0], collected[0].content)
        } catch {}

        props.createMessage(channel, content)
          .then((m) => {
            //console.log(extracted.emojisToAddToEmbed)
            for (const emoji of extracted.emojisToAddToEmbed) {
              try {
                m.addReaction(emoji).catch(() => { /* Do Nothing */ })
              } catch (error) {
                
              }
            }
            ReactionRole.create({
              guildId: props.guild.id,
              channelId: channel,
              messageId: m.id,
              type: 'unique',
              roles: extracted.roles,
              limit: 0,
            })
              .catch(() => {
                props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
              })
          })
          .catch(() => {
            props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
          })
        props.deleteMessage()
      }
    })

    menu.start(props.message)
  }
  private _handleMenuTypeBinding(props: CommandProps): void {
    const menu = new Menu<[Eris.Message, Eris.Message, Eris.Message]>(this.yua, {
      purgeAllWhenDone: true,
      collectorTimeout: 300000,
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now for the reaction role menu message. Please specify either normal content for me to say or create an embed using [my embed creator](https://embedbuilder.yua.gg/)\n\n*type `cancel` at any time to stop the reaction role creation process*",
        },
      },
      callback: async (msg) => {
        return this._menuContentLogic(props, msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the next thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```???? @thumbsUpRole ???? @thumbsDownRole ...```",
        },
      },
      callback: (msg) => {
        return this._emojiRoleLogic(msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Yay, you are almost there! The last thing I need to know is where you would like me to put the menu.\n\nPlease mention a channel like so: `#channel-name`",
        },
      },
      callback: (msg) => {
        return this._validateChannel(props, msg)
      },
    })

    menu.once('end', async (collected, reason) => {
      if (this._handleCollectorEnd(props, reason)) {
        const extracted = this._extractEmojiRolePairs(collected[1])
        const channel = collected[2].channelMentions[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any = collected[0].content
        try {
          content = await getEmbedJson(collected[0], collected[0].content)
        } catch {}

        props.createMessage(channel, content)
          .then((m) => {
            //console.log(extracted.emojisToAddToEmbed)
            for (const emoji of extracted.emojisToAddToEmbed) {
              try {
                m.addReaction(emoji).catch(() => { /* Do Nothing */ })
              } catch (error) {
                
              }
            }
            ReactionRole.create({
              guildId: props.guild.id,
              channelId: channel,
              messageId: m.id,
              type: 'binding',
              roles: extracted.roles,
              limit: 0,
            })
              .catch(() => {
                props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
              })
          })
          .catch(() => {
            props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
          })
        props.deleteMessage()
      }
    })

    menu.start(props.message)
  }
  private _handleMenuTypeLimited(props: CommandProps): void {
    const menu = new Menu<[Eris.Message, Eris.Message, Eris.Message, Eris.Message]>(this.yua, {
      purgeAllWhenDone: true,
      collectorTimeout: 300000,
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now for the reaction role menu message. Please specify either normal content for me to say or create an embed using [my embed creator](https://embedbuilder.yua.gg/)\n\n*type `cancel` at any time to stop the reaction role creation process*",
        },
      },
      callback: async (msg) => {
        return this._menuContentLogic(props, msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the next thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```???? @thumbsUpRole ???? @thumbsDownRole ...```",
        },
      },
      callback: (msg) => {
        return this._emojiRoleLogic(msg)
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Okie! Now I need to know how many roles you would like to limit members to receiving!",
        },
      },
      callback: (msg) => {
        if (!parseInt(msg.content)) {
          return `${msg.content} is not a valid number, please send a valid number`
        }

        return true
      },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Yay, you are almost there! The last thing I need to know is where you would like me to put the menu.\n\nPlease mention a channel like so: `#channel-name`",
        },
      },
      callback: (msg) => {
        return this._validateChannel(props, msg)
      },
    })

    menu.once('end', async (collected, reason) => {
      if (this._handleCollectorEnd(props, reason)) {
        const extracted = this._extractEmojiRolePairs(collected[1])
        const amount = parseInt(collected[2].content)
        const channel = collected[3].channelMentions[0]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any = collected[0].content
        try {
          content = await getEmbedJson(collected[0], collected[0].content)
        } catch {}

        props.createMessage(channel, content)
          .then((m) => {
            //console.log(extracted.emojisToAddToEmbed)
            for (const emoji of extracted.emojisToAddToEmbed) {
              try {
                m.addReaction(emoji).catch(() => { /* Do Nothing */ })
              } catch (error) {
                
              }
            }
            ReactionRole.create({
              guildId: props.guild.id,
              channelId: channel,
              messageId: m.id,
              type: 'limited',
              roles: extracted.roles,
              limit: amount,
            })
              .catch(() => {
                props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
              })
          })
          .catch(() => {
            props.quickEmbed(undefined, "An error occured while trying to create menu", colors.error)
          })
        props.deleteMessage()
      }
    })

    menu.start(props.message)
  }

  private async _menuContentLogic(props: CommandProps, msg: Eris.Message): Promise<string | boolean> {
    try {
      await getEmbedJson(msg, msg.content)
      
      return Promise.resolve(true)
    } catch (error) {
      const err: { failed: boolean, toolarge: boolean, invalid: boolean, err: unknown } = error
      if (err.toolarge) {
        return "Embed is too large, it must not exceed 6000 characters"
      } else if (err.failed) {
        return "Failed to download embed file"
      } else {
        return new Promise((res) => {
          const uSure = new Menu<[Eris.Emoji]>(this.yua, {
            collectorTimeout: 60000,
            purgeAllWhenDone: true,
          })
          uSure.addReactionQuestion({
            content: {
              "embed": {
                "color": 16761517,
                "title": "Warning",
                "description": "Are you sure your menu message is how you want it? I ran some tests on it and it does not appear to be a valid embed. If you choose to continue I will send the menu message as plain text instead of an embed.",
              },
            },
            reactions: [
              "????",
              "????",
            ],
          })
          uSure.once('end', (col, reason) => {
            if (reason === 'finish') {
              if (col[0].name === '????') {
                res(true)
              } else {
                res(`When attempting to parse your embed, I received the error\n\`\`\`${err.err}\`\`\`\nPlease send the fixed embed below: `)
              }
            } else {
              res("Please send role menu message again")
            }
          })
          uSure.start(props.message)
        })
      }
    }
  }

  private _extractEmojiRolePairs(msg: Eris.Message): { roles: Map<string, string>, emojisToAddToEmbed: string[] } {
    const args: string[][] = this._chunk(msg.content.split(" ")
      .filter(args => args.length > 0), 2) as string[][]
    const roles = new Map<string,string>() // Emoji, RoleId
    const emojisToAddToEmbed: string[] = []
    for (const [emoji, role] of args) {
      const roleId = role.replace("<@&", "").replace(">", "")
      const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
      roles.set(emojiId, roleId)
      emojisToAddToEmbed.push(emoji.replace("<", "").replace(">", ""))
    }

    return {
      roles,
      emojisToAddToEmbed,
    }
  }

  private _validateChannel(props: CommandProps, msg: Eris.Message): boolean | string {
    if (!msg.channelMentions[0]) return "That doesn't seem right. Please mention a channel like so: `#channel-name`"
    const channel = props.guild.channels.get(msg.channelMentions[0])
    if (!channel) return "I could not locate that channel. Do I have the correct permissions?"

    const yuaPerms = props.checkIfHasPerms(channel, props.yuaMember, this.extra.yuaPermissions)
    if (!yuaPerms.hasPerms) {
      return  `Sorry, it seems I don't have **${yuaPerms.missingPerm}** permission, I cannot use that channel!`
    }
    
    return true
  }
  private _emojiRoleLogic(msg: Eris.Message): boolean | string {
    const args: string[][] = this._chunk(msg.content.split(" ")
      .filter(args => args.length > 0), 2) as string[][]
        
    const guild = this.yua.client.guilds.get(msg.guildID)

    const uniEmojiRegex = new RegExp(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\p{Extended_Pictographic})/, "u")
    const discordEmojiRegex = new RegExp(/<(a|):.*:.*>/)
    const roleRegex = new RegExp(/<@&.*>/)

    const roles = new Map<string, string>() // Emoji, RoleId

    for (const [emoji, role] of args) {
      if (roles.size < 1) {
        if (!uniEmojiRegex.test(emoji) && !discordEmojiRegex.test(emoji) && !CountryFlags.includes(emoji)) return "Incorrectly formatted! Please follow this format: ```???? @thumbsUpRole ???? @thumbsDownRole ...```"
        else {
          if (!emoji) return "Incorrectly formatted! Please follow this format: ```???? @thumbsUpRole ???? @thumbsDownRole ...```"
          if (!role) return `Incorrectly formatted at \`\`\`${emoji} \`\`\`\nMissing role, please follow the format: \`\`\`???? @thumbsUpRole ???? @thumbsDownRole ...\`\`\``
          if (!roleRegex.test(role)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
          else {
            const roleId = role.replace("<@&", "").replace(">", "")
            const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
            if (!Array.from(guild.roles.keys()).includes(roleId)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
            if (!uniEmojiRegex.test(emoji) && !guild.emojis.map(e => e.id).includes(emojiId) && !CountryFlags.includes(emoji)) return  `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n The emoji \`${emoji}\` does not belong to this guild`
            roles.set(emoji, roleId)
          }
        }
      } else {
        if (!emoji) return "Incorrectly formatted! Please follow this format: ```???? @thumbsUpRole ???? @thumbsDownRole ...```"
        if (!role) return `Incorrectly formatted at \`\`\`${emoji} \`\`\`\nMissing role, please follow the format: \`\`\`???? @thumbsUpRole ???? @thumbsDownRole ...\`\`\``
        if (!roleRegex.test(role)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
        else {
          const roleId = role.replace("<@&", "").replace(">", "")
          const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
          if (!Array.from(guild.roles.keys()).includes(roleId)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
          if (!uniEmojiRegex.test(emoji) && !guild.emojis.map(e => e.id).includes(emojiId) && !CountryFlags.includes(emoji)) return  `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n The emoji \`${emoji}\` does not belong to this guild`
          roles.set(emoji, roleId)
        }
      }
    }

    if (roles.size > 20) return "Woah there, your menu is too powerful. Discord only allows a max of 20 reactions on a message!"

    return true
  }
  private _handleCollectorEnd(props: CommandProps, reason: string): boolean {
    const {
      send,
      deleteMessage,
    } = props
    //console.log("reason:",reason)
    switch (reason) {
    case 'cancel':
      send({
        embed: {
          "color": 16756141, 
          "description": "Reaction Role Creation Cancelled!",
        },
      })
      deleteMessage()

      return false
    case 'error':
      send({
        embed: {
          "color": 16756141, 
          "description": "Reaction Role Creation Exited With Error!",
        },
      })
      deleteMessage()

      return false
    case 'timedOut':
      send({
        embed: {
          "color": 16756141, 
          "description": "Reaction Role Creation Timed Out!",
        },
      })
      deleteMessage()

      return false
    case 'finish':
      return true
    }
  }
  private _chunk(list: unknown[], groupAmt: number): unknown[][] {
    let idx = 0
    const res: unknown[][] = []

    while (idx < list.length) {
      if (idx % groupAmt === 0) res.push([])
      res[res.length - 1].push(list[idx++])
    }

    return res
  }
}

export = YuaCommand
