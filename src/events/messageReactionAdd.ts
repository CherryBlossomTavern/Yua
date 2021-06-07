import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
import { checkIfHasPerms } from '../utils'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member): Promise<void> => {
    if (message.channel.type !== 0) return
    if (reactor.bot) return

    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return

    const guild = yua.client.guilds.get(message.guildID)
    const channel = guild.channels.get(message.channel.id)
    const yuaMember = guild.members.get(yua.client.user.id)
    if (!checkIfHasPerms(channel, yuaMember, ['manageRoles', 'addReactions', 'manageMessages']).hasPerms) return

    const emojis = Array.from(rrMenu.roles.keys())
    if (!emojis.includes(emoji.id) && !emojis.includes(emoji.name)) {
      yua.client.removeMessageReactionEmoji(message.channel.id, message.id, emoji.id || emoji.name)

      return
    }

    const handleAdd = ():void => {
      const roleId = rrMenu.roles.get(emoji.id) || rrMenu.roles.get(emoji.name)
      const role = guild.roles.find(r => r.id === roleId)
      if (!role) return
      if (!reactor.roles.includes(roleId)) {
        reactor.addRole(role.id, "RR Menu").catch(() => { /* Do Nothing (Reactor is higher than bot role) */ })
      }
    }
    const handleUnique = ():void => {
      //
      
    }
    const handleRemove = ():void => {
      //
    }

    switch(rrMenu.type) {
    case 'add':
      handleAdd()
      break
    case 'remove':
      handleRemove()
      break
    case 'unique':
      handleUnique()
      break
    }
  }
