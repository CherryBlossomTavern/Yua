import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member): Promise<void> => {
    if (message.channel.type !== 0) return 
    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return
    const emojis = Array.from(rrMenu.roles.keys())
    if (!emojis.includes(emoji.id)) {
      yua.client.removeMessageReactionEmoji(message.channel.id, message.id, emoji.id)

      return
    }

    const handleAdd = ():void => {
      const roleId = rrMenu.roles.get(emoji.id)
      if (!reactor.roles.includes(roleId)) {
        const role = yua.client.guilds.get(message.guildID).roles.get(roleId)
        if (role) {
          reactor.addRole(role.id, "RR Menu")
        }
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
