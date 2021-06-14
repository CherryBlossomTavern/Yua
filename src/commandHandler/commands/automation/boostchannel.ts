import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { colors } from '../../../config'
import { BoostMessage } from '../../../database/models'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("boostchannel", {
      usage: "[channel|none]",
      description: "Set a channel for me to send your boost message in whenever someone boosts.\nFor boost messages to work you must have boost system messages on in your server settings.",
      category: "automation",
      aliases: [
        "bch",
      ],
      userPermissions: [
        'manageMessages',
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
      ],
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public async execute(props: CommandProps): Promise<void> {
    const {
      quickEmbed,
      guild,
      args,
      message,
      checkIfHasPerms,
      yuaMember,
    } = props

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
          if (!res.channelId) {
            quickEmbed(undefined, `You don't have a boost channel set up!\nUse \`yua boostchannel [channel]\` to set up a channel.`, colors.info)
          } else {
            quickEmbed(undefined, `Boost message channel currently set to <#${res.channelId}>${res.message ? "" : `\n\n**Warning**\n*You do not have a boost message set up.*\n*Use \`yua boostmessage [embed|message]\` to do so.*`}`)
          }
        } else {
          if (args[0].toLowerCase() !== 'none') {
            const channelId = message.channelMentions[0]
            const channel = guild.channels.get(channelId)
            if (!channel) {
              quickEmbed(undefined, `Sorry, but I could not find the channel \`${args[0]}\``, colors.error)
    
              return
            }
            const yuaPerm = checkIfHasPerms(channel, yuaMember, ['readMessages', 'sendMessages', 'embedLinks'])
            if(!yuaPerm.hasPerms) {
              quickEmbed(undefined, `Sorry, it seems I don't have **${yuaPerm.missingPerm}** permission in that channel, I cannot use it until I have that permission!`, colors.error)
    
              return
            }
    
            await res.updateOne({ channelId: channel.id })
            await res.save()
            quickEmbed(undefined, "I successfully changed the boost message channel to " + `<#${channel.id}>`, colors.success)
          } else {
            await res.updateOne({ channelId: "" })
            await res.save()
            quickEmbed(undefined, "I successfully removed the boost message channel", colors.success)
          }
        }
      })
      .catch(() => { /* Do Nothing */ })

    return
  }
}

export = YuaCommand
