/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { BoostMessage } from '../../../database/models'
import {
  colors,
  BoostMessageReplaceKeys as BMRK,
  BoostNeeded,
  NextTier,
  TierSuffix,
} from '../../../config'
class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("testboost", {
      usage: "",
      description: "I will pretend to boost your server so you can see your boost message.\nFor boost messages to work you must have boost system messages on in your server settings.",
      category: "automation",
      aliases: [],
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
      createMessage,
      quickEmbed,
      guild,
      yuaMember,
    } = props

    BoostMessage.findOne({ guildId: guild.id })
      .then((res) => {
        if (!res) {
          quickEmbed(undefined, "You dont have a boost message or channel set up!\nGet started with `yua boostmessage [embed|message|help]`", colors.error)

          return
        }
        if (!res.message) {
          quickEmbed(undefined, "You dont have a boost message set up!\nGet started with `yua boostmessage [embed|message|help]`", colors.error)

          return
        }
        if (!res.channelId) {
          quickEmbed(undefined, "You dont have a boost channel set up!\nGet started with `yua boostchannel [channel]`", colors.error)

          return
        }
        let serverIcon = guild.dynamicIconURL('png')
        if (serverIcon?.includes('a_')) serverIcon = serverIcon.replace(".png", ".gif")
        let serverBanner = guild.dynamicBannerURL('png')
        if (serverBanner?.includes('a_')) serverBanner = serverBanner.replace(".png", ".gif")

        let content: any = res.message
          .replace(new RegExp(BMRK.User, 'g'), `<@${yuaMember.id}>`)
          .replace(new RegExp(BMRK.DisplayName, 'g'), yuaMember.nick || yuaMember.username)
          .replace(new RegExp(BMRK.Avatar, 'g'), yuaMember.avatarURL)
          .replace(new RegExp(BMRK.ServerIcon, 'g'), serverIcon)
          .replace(new RegExp(BMRK.ServerBanner, 'g'), serverBanner || "")
          .replace(new RegExp(BMRK.Boosts, 'g'), guild.premiumSubscriptionCount.toString())
          .replace(new RegExp(BMRK.Tier, 'g'), guild.premiumTier.toString())
          .replace(new RegExp(BMRK.BoostsNeeded, 'g'), BoostNeeded[guild.premiumTier] - guild.premiumSubscriptionCount > 0 ? new String(BoostNeeded[guild.premiumTier] - guild.premiumSubscriptionCount).toString() : "∞")
          .replace(new RegExp(BMRK.NextTier, 'g'), NextTier[guild.premiumTier])
          .replace(new RegExp(BMRK.Boost4Tier, 'g'), BoostNeeded[guild.premiumTier])
          .replace(new RegExp(BMRK.TierSuffix, 'g'), TierSuffix[guild.premiumTier])
          .replace(new RegExp(BMRK.NextTierSuffix, 'g'), TierSuffix[NextTier[guild.premiumTier]])

        try {
          content = JSON.parse(content)
        } catch {}

        createMessage(res.channelId, content)
        quickEmbed(undefined, "Test boost message sent", colors.success)
      })
      .catch(() => { /* Do Nothing */ })

    return
  }
}

export = YuaCommand
