/* eslint-disable camelcase */
import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { BoostMessage } from '../../../database/models'
import { colors } from '../../../config'
import { Menu } from '../../../classes'
import Eris from 'eris'
import { getEmbedJson } from '../../../utils'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("boostmessage", {
      usage: "[embed|message|help]",
      description: "Set a message for me to send whenever someone boosts.\nFor boost messages to work you must have boost system messages on in your server settings.\nUse \"yua boostmessage help\" for info on variables",
      category: "automation",
      aliases: [
        "bmsg",
      ],
      userPermissions: [
        'manageMessages',
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
        'attachFiles',
      ],
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      send,
      quickEmbed,
      guild,
      args,
      deleteMessage,
    } = props

    if (args[0] && args[0].toLowerCase() === 'help') {
      send({
        embed: {
          color: colors.info,
          title: "Boost Message Help",
          description: "Boost message not only enables servers to show when a user boosts in a fancy message, but it also has a wide variety of options to make your boost message more customizable.\nThe main feature I offer is dynamic value placeholders or *DVPs* for short. Below are are handful of placeholders you can put in your boost embed/message that I will replace with actual values before sending.",
          fields: [
            {
              name: "DVPs",
              value: "`{USER}`: Mention user who boosted\n`{DISPLAYNAME}`: Boosters display name (will not ping them)\n`{AVATAR}`: Boosters avatar url\n`{SERVERICON}`: Servers icon url\n`{SERVERBANNER}`: Server banner url\n`{BOOST}`: Server total boosts\n`{BOOSTNEEDED}`: Boost needed until next tier\n`{BOOST4TIER}`: Total boost needed for tier\n`{TIER}`: Current boost tier\n`{NEXTTIER}`: Next boost tier\n`{TIERSUFFIX}`: Suffix for tier. EG: st, nd, rd\n`{NEXTTIERSUFFIX}`: Suffix for next tier. EG: st, nd, rd",
              inline: false,
            },
            {
              name: "Usage",
              value: "`yua boostmessage [embed|message]`",
              inline: false,
            },
            {
              name: "Disabling Message",
              value: "To disable boost message set boostchannel to none\n`yua boostchannel none`",
              inline: false,
            },
            {
              name: "Enabling System Messages",
              value: "For me to send the boost message I will have to know when someone is boosing. For this to work you will need to enable \"Send a message when someone boosts this server\" in the Server Overview page. The system message channel does not have to be set to the same channel as your boost channel. It just needs to be set to a channel I can see somewhere!",
              inline: false,
            },
            {
              name: "Extra Info",
              value: "Visit [this link](https://embedbuilder.yua.gg) to easily create embeds!\nI also provided an example embed below using DVPs, I hope this clears up any questions you may have had!",
              inline: false,
            },
          ],
        },
      })
      send(undefined, {
        name: "example-dvp-embed.json",
        file: Buffer.from(JSON.stringify({
          "embed": {
            "color": 16772525,
            "title": "{DISPLAYNAME} Just Boosted!!!",
            "description": "Thankyou {USER} for donating to the server. We really appreciate it!!\nBecause of *{DISPLAYNAME}* we are now at tier {TIER} with {BOOST} boost.\nWe need {BOOSTNEEDED} more boost until we reach {NEXTTIER}{NEXTTIERSUFFIX} tier!",
            "thumbnail": {
              "url": "{AVATAR}",
            },
            "image": {
              "url": "{SERVERBANNER}",
            },
          },
        }, undefined, 2)),
      })

      return
    }

    BoostMessage.findOne({ guildId: guild.id })
      .then(async (res) => {
        if (!res) {
          res = await BoostMessage.create({
            guildId: guild.id,
            channelId: "",
            message: "", 
          })
        }

        if (!args[0]) {
          if (!res.message) {
            quickEmbed(undefined, "You don't have a boost message set up!\nUse `yua boostmessage <embed|message>` to create a message\nYou can find my embed creator [here](https://embedbuilder.yua.gg)", colors.info)
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let message: any = res.message
            try {
              message = JSON.stringify(JSON.parse(message), undefined, 2)
            } catch {}
            send({
              embed: {
                description: "Your embed/message is located in the file above!\nTo change it use `yua boostmessage [embed|message]`.\n[embed builder](https://embedbuilder.yua.gg)" + `${res.channelId ? "" : `\n\n**Warning**\n*You do not have a boost channel set up.*\n*Use \`yua boostchannel [channel|none]\` to do so.*`}`,
                color: colors.default,
              },
            }, {
              name: `${guild.name.replace(/\s+/, "-")}-boost-message.txt`,
              file: Buffer.from(message),
            })
          }
        } else {
          const test = await this._contentLogic(props)
          if (typeof test === 'string') {
            quickEmbed(undefined, test, colors.error)

            return
          } else {
            let content: string = args.join(" ")
            try {
              content = JSON.stringify(await getEmbedJson(props.message, props.args.join(" ")))
            } catch {}

            await res.updateOne({ message: content })
            await res.save()
            quickEmbed(undefined, "I successfully updated your boost message!", colors.success)
            deleteMessage()
          }
        }
      })
      .catch(() => { /* Do Nothing */ })

    return
  }
  private async _contentLogic(props: CommandProps): Promise<string | boolean> {
    try {
      await getEmbedJson(props.message, props.args.join(" "))
      
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
                "description": "Are you sure your boost message message is how you want it? I ran some tests on it and it does not appear to be a valid embed. If you choose to continue I will send the boost message as plain text instead of an embed.",
              },
            },
            reactions: [
              "👍",
              "👎",
            ],
          })
          uSure.once('end', (col, reason) => {
            if (reason === 'finish') {
              if (col[0].name === '👍') {
                res(true)
              } else {
                res(`When attempting to parse your embed, I received the error\n\`\`\`${err.err}\`\`\`\n`)
              }
            } else {
              res("Operation aborted. Boost message not set!")
            }
          })
          uSure.start(props.message)
        })
      }
    }
  }
}

export = YuaCommand
