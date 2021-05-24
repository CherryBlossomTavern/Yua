import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
export default (yua: Yua) =>
  async (message: Eris.Message): Promise<void> => {
    if (message.channel.type !== 0) return 
    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return
    const emojis = Array.from(rrMenu.roles.keys())
    for (const emoji of emojis) {
      const emj = yua.client.guilds.get(message.guildID).emojis.find(e => e.id === emoji)
      if (!emj) continue
      yua.client.addMessageReaction(message.channel.id, message.id, `${ emj.animated ? "a" : "" }:${emj.name}:${emj.id}`)
    }
  }
