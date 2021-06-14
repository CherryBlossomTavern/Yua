/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Message,
} from 'eris'
import {
  boostMessageTypes,
} from '../config'
import { BoostMessage } from '../database/models'
import {
  BoostMessageReplaceKeys as BMRK,
  BoostNeeded,
  NextTier,
  TierSuffix,
} from '../config'
import Yua from 'src/client'

export default (yua: Yua) => (msg: Message): void => {
  yua.commandHandler.parseCommand(msg)

  //console.log(msg)
  if (boostMessageTypes.includes(msg.type)) {
    BoostMessage.findOne({ guildId: msg.guildID })
      .then(res => {
        if (!res) return
        if (!res.channelId) return
        if (!res.message) return
        const guild = yua.client.guilds.get(msg.guildID)
        let serverIcon = guild.dynamicIconURL('png')
        if (serverIcon?.includes('a_')) serverIcon = serverIcon.replace(".png", ".gif")
        let serverBanner = guild.dynamicBannerURL('png')
        if (serverBanner?.includes('a_')) serverBanner = serverBanner.replace(".png", ".gif")

        let content: any = res.message
          .replace(new RegExp(BMRK.User, 'g'), `<@${msg.member.id}>`)
          .replace(new RegExp(BMRK.DisplayName, 'g'), msg.member.nick || msg.member.username)
          .replace(new RegExp(BMRK.Avatar, 'g'), msg.member.avatarURL)
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

        yua.client.createMessage(res.channelId, content)
          .catch(() => { /* Do Nothing */ })
      })
      .catch(() => { /* Do Nothing */ })
  }
}
