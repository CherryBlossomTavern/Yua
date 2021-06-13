import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
import { checkIfHasPerms } from '../utils'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji): Promise<void> => {
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
    if (emojis.includes(emoji.id) || emojis.includes(emoji.name)) {
      yua.client.addMessageReaction(message.channel.id, message.id, emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name).catch(() => { /* Do Nothing */ })
    }
  }
