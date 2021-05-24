import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji, userId: string): Promise<void> => {
    if (message.channel.type !== 0) return 
    const rrMenu = await ReactionRole.findOne({
      guildId: message.guildID,
      channelId: message.channel.id,
      messageId: message.id, 
    })
    if (!rrMenu) return
    const emojis = Array.from(rrMenu.roles.keys())
    if (emojis.includes(emoji.id)) {
      if (userId === yua.client.user.id) {
        const emj = yua.client.guilds.get(message.guildID).emojis.find(e => e.id === emoji.id)
        if (!emj) return
        yua.client.addMessageReaction(message.channel.id, message.id, `${ emj.animated ? "a" : "" }:${emj.name}:${emj.id}`)
      }
    }

    const handleAdd = ():void => {
      const roleId = rrMenu.roles.get(emoji.id)
      yua.client.guilds.get(message.guildID).removeMemberRole(userId, roleId, "RR Menu")
    }
    const handleUnique = ():void => {
      //
      
    }

    switch(rrMenu.type) {
    case 'add':
      handleAdd()
      break
    case 'unique':
      handleUnique()
      break
    }

  }
