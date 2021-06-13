import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
import { checkIfHasPerms } from '../utils'
export default (yua: Yua) =>
  async (message: Eris.Message): Promise<void> => {
    if (message.channel.type !== 0) return 

    const guild = yua.client.guilds.get(message.guildID)
    const channel = guild.channels.get(message.channel.id)
    const yuaMember = guild.members.get(yua.client.user.id)

    if (!checkIfHasPerms(channel, yuaMember, ['manageRoles', 'addReactions', 'manageMessages']).hasPerms) return

    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return
    const emojis = Array.from(rrMenu.roles.keys())
    for (const emoji of emojis) {
      const emj = guild.emojis.find(e => e.id === emoji)
      yua.client.addMessageReaction(message.channel.id, message.id, emj ? `${ emj.animated ? "a" : "" }:${emj.name}:${emj.id}` : emoji).catch(() => { /* Do Nothing */ })
    }
  }
