/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { Menu } from '../../../classes'
import Eris from 'eris'
import { ReactionRole } from '../../../database/models'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("rrcreate", {
      usage: "",
      description: "Create a new reaction role menu with my step by step setup!\nUse https://embedbuilder.yua.gg/ to create your embed!",
      category: "reaction-roles",
      aliases: [],
      userPermissions: [
        'manageRoles',
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
        'manageMessages',
        'addReactions',
      ],
      type: 'all',
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      message,
    } = props

    const addEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846179620730044457'), // Add
      removeEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846179620440506399'), // Remove
      uniqueEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846180587093360652'), // Unique
      bindingEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846182159483928617'), // Binding
      limitedEmoji = this.yua.client.guilds.get('809588974821179404').emojis.find(e => e.id === '846184576694616074') // Limited

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
      if (this._handleCollectorEnd(reason, props)) {
        const type = emojiToType.get(collected[0].id)
        switch (type) {
        case 'add':
          this._handleMenuTypeAdd(props)
          break
        case 'remove':
          break
        case 'binding':
          break
        case 'limited':
          break
        case 'unique':
          break
        }
      }
    })

    rr.start(message)

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
      callback: () => { return true },
    })
    menu.addResponseQuestion({
      content: {
        "embed": {
          "color": 16772525,
          "description": "Ooh Nice! Okay, the last thing I need is for you to tell me what emojis and roles you want to be put on the reaction role menu!\n\nTo do this please follow this format:\n```👍 @thumbsUpRole 👎 @thumbsDownRole ...```",
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
        if (!msg.channelMentions[0]) return "That doesn't seem right. Please mention a channel like so: `#channel-name`"
        const channel = props.guild.channels.get(msg.channelMentions[0])
        if (!channel) return "I could not locate that channel. Do I have the correct permissions?"

        const yuaPerms = props.checkIfHasPerms(channel, props.yuaMember, [
          'readMessages',
          'sendMessages',
          'manageMessages',
          'addReactions',
        ])
        if (!yuaPerms.hasPerms) {
          if (yuaPerms.missingPerm !== 'sendMessages' && yuaPerms.missingPerm !== 'readMessages') {
            return  `Sorry, it seems I don't have **${yuaPerms.missingPerm}** permission, I cannot do that!`
          }
        }
        
        return true
      },
    })

    menu.once('end', (collected, reason) => {
      if (this._handleCollectorEnd(reason, props)) {
        const args: string[][] = this._chunk(collected[1].content.split(" ")
          .filter(args => args.length > 0), 2) as string[][]
        const channel = collected[2].channelMentions[0]
        const content = collected[0].content
        const roles = new Map<string,string>() // Emoji, RoleId
        for (const [emoji, role] of args) {
          const roleId = role.replace("<@&", "").replace(">", "")
          const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
          roles.set(emojiId, roleId)
        }
        props.send(`Done`)
      }
    })

    menu.start(props.message)

    props.deleteMessage()
  }
  private _handleMenuTypeRemove(props: CommandProps): void {
    
  }
  private _handleMenuTypeUnique(props: CommandProps): void {
    
  }
  private _handleMenuTypeBinding(props: CommandProps): void {
    
  }
  private _handleMenuTypeLimited(props: CommandProps): void {
    
  }
  private _emojiRoleLogic(msg: Eris.Message): boolean | string {
    const args: string[][] = this._chunk(msg.content.split(" ")
      .filter(args => args.length > 0), 2) as string[][]
        
    const guild = this.yua.client.guilds.get(msg.guildID)

    const uniEmojiRegex = new RegExp(/\p{Extended_Pictographic}/, "u")
    const discordEmojiRegex = new RegExp(/<(a|):.*:.*>/)
    const roleRegex = new RegExp(/<@&.*>/)

    const roles = new Map<string, string>() // Emoji, RoleId

    for (const [emoji, role] of args) {
      if (roles.size < 1) {
        if (!uniEmojiRegex.test(emoji) && !discordEmojiRegex.test(emoji)) return "Incorrectly formatted! Please follow this format: ```👍 @thumbsUpRole 👎 @thumbsDownRole ...```"
        else {
          if (!emoji) return "Incorrectly formatted! Please follow this format: ```👍 @thumbsUpRole 👎 @thumbsDownRole ...```"
          if (!role) return `Incorrectly formatted at \`\`\`${emoji} \`\`\`\nMissing role, please follow the format: \`\`\`👍 @thumbsUpRole 👎 @thumbsDownRole ...\`\`\``
          if (!roleRegex.test(role)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
          else {
            const roleId = role.replace("<@&", "").replace(">", "")
            const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
            if (!Array.from(guild.roles.keys()).includes(roleId)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
            if (!uniEmojiRegex.test(emoji) && !guild.emojis.map(e => e.id).includes(emojiId)) return  `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n The emoji \`${emoji}\` does not belong to this guild`
            roles.set(emoji, roleId)
          }
        }
      } else {
        if (!emoji) return "Incorrectly formatted! Please follow this format: ```👍 @thumbsUpRole 👎 @thumbsDownRole ...```"
        if (!role) return `Incorrectly formatted at \`\`\`${emoji} \`\`\`\nMissing role, please follow the format: \`\`\`👍 @thumbsUpRole 👎 @thumbsDownRole ...\`\`\``
        if (!roleRegex.test(role)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
        else {
          const roleId = role.replace("<@&", "").replace(">", "")
          const emojiId = emoji.replace(/<(a|):.*:/, "").replace(">", "")
          if (!Array.from(guild.roles.keys()).includes(roleId)) return `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n \`${role}\` is not a valid role`
          if (!uniEmojiRegex.test(emoji) && !guild.emojis.map(e => e.id).includes(emojiId)) return  `Incorrectly formatted at \`\`\`${emoji} ${role}\`\`\`\n The emoji \`${emoji}\` does not belong to this guild`
          roles.set(emoji, roleId)
        }
      }
    }

    return true
  }
  private _handleCollectorEnd(reason: string, props: CommandProps): boolean {
    const {
      send,
      deleteMessage,
    } = props
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

      return false
    case 'timedOut':
      send({
        embed: {
          "color": 16756141, 
          "description": "Reaction Role Creation Timed Out!",
        },
      })

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
