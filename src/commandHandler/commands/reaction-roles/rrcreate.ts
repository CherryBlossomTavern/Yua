/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { Menu } from '../../../classes'
import Eris from 'eris'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("rrcreate", {
      usage: "",
      description: "Create a new reaction role menu with my step by step setup!\nUse https://embedbuilder.yua.gg/ to create your embed!",
      category: "reaction-roles",
      aliases: [],
      permissions: [
        'manageRoles',
      ],
      type: 'all', // Not Yet Implemented
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

    const emojiToType = new Map<string,string>([
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
          "fields": [
            {
              "name": "<:RRadd:846179620730044457>",
              "value": "Reacting will give the user any or all roles in this menu. Removing the reaction will remove the role.",
              "inline": true,
            },
            {
              "name": "<:RRremove:846179620440506399>",
              "value": " Reacting will take away the selected roles. Roles can only be removed, not added.",
              "inline": true,
            },
            {
              "name": "<:RRUnique:846180587093360652>",
              "value": "Users can only hold one role in the menu at a time.",
              "inline": true,
            },
            {
              "name": "<:RRBinding:846182159483928617>",
              "value": "Reacting will result in a role being added to the user that cannot be removed by the same menu. ",
              "inline": true,
            },
            {
              "name": "<:RRLimited:846184576694616074>",
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
      switch (reason) {
      case 'cancel':
        message.channel.createMessage({
          embed: {
            "color": 16756141, 
            "description": "Reaction Role Creation Cancelled!",
          },
        })
        message.delete().catch(() => {})

        break
      case 'error':
        message.channel.createMessage({
          embed: {
            "color": 16756141, 
            "description": "Reaction Role Creation Exited With Error!",
          },
        })
        message.delete().catch(() => {})

        break
      case 'timedOut':
        message.channel.createMessage({
          embed: {
            "color": 16756141, 
            "description": "Reaction Role Creation Timed Out!",
          },
        })
        message.delete().catch(() => {})

        break
      case 'finish':
        message.channel.createMessage(emojiToType.get(collected[0].id))
        break
      }
    })
    
    rr.start(message)

    return
  }
}

export = YuaCommand
