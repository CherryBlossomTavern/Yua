import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
import { checkIfHasPerms } from '../utils'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji, userId: string): Promise<void> => {
    if (message.channel.type !== 0) return

    const guild = yua.client.guilds.get(message.guildID)
    const channel = guild.channels.get(message.channel.id)
    //const reactor = guild.members.get(userId)
    const yuaMember = guild.members.get(yua.client.user.id)

    if (!checkIfHasPerms(channel, yuaMember, ['manageRoles', 'addReactions', 'manageMessages']).hasPerms) return
    //if (reactor.bot) return

    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return

    const emojis = Array.from(rrMenu.roles.keys())
    if (emojis.includes(emoji.id) || emojis.includes(emoji.name)) {
      if (userId === yua.client.user.id) {
        return yua.client.addMessageReaction(message.channel.id, message.id, emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name)
      }
    }

    const roleId = rrMenu.roles.get(emoji.id) || rrMenu.roles.get(emoji.name)
    const role = guild.roles.find(r => r.id === roleId)
    if (!role) return

    const removeRole = ():void => {
      guild.removeMemberRole(userId, roleId, "RR Menu").catch(() => { /* Do Nothing */ })
    }

    switch(rrMenu.type) {
    case 'add':
      removeRole()
      break
    case 'remove':
      removeRole()
      break
    case 'unique':
      removeRole()
      break
    case 'limited': 
      removeRole()
      break
    }

  }
