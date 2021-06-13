import Eris from 'eris'
import Yua from 'src/client'
import { ReactionRole } from '../database/models'
import { checkIfHasPerms } from '../utils'
export default (yua: Yua) =>
  async (message: Eris.Message, emoji: Eris.Emoji, reactor: Eris.Member): Promise<void> => {
    if (message.channel.type !== 0) return
    if (reactor.bot) return

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
    if (!emojis.includes(emoji.id) && !emojis.includes(emoji.name)) {
      yua.client.removeMessageReactionEmoji(message.channel.id, message.id, emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name).catch(() => { /* Do Nothing */ })

      return
    }

    const roleId = rrMenu.roles.get(emoji.id) || rrMenu.roles.get(emoji.name)
    const role = guild.roles.find(r => r.id === roleId)
    if (!role) return

    const addRole = ():void => {
      reactor.addRole(role.id, "RR Menu").catch(() => { /* Do Nothing (Reactor is higher than bot role) */ })
      // if (rrMenu.type === 'unique') {
      //   uniq()
      // }
    }

    // Could not get unique working as intended, will make it to where they have to unreact to their past one first
    // const uniq = (): void => {
    //   const member = guild.members.get(reactor.id)
    //   const reactorPrevRoles = member.roles.filter(r => Array.from(rrMenu.roles.values()).includes(r))
    //   if (reactorPrevRoles[0]) {
    //     for (const prev of reactorPrevRoles) {
    //       member.removeRole(prev, "RR Menu").catch(() => { /* Do Nothing */ })
    //       const prevRoleEmoji = Array.from(rrMenu.roles.entries()).find(r => r[1] === prev)[0]
    //       const emj = guild.emojis.find(e => e.id === prevRoleEmoji)
    //       yua.client.removeMessageReaction(channel.id, message.id, emj ? `${ emj.animated ? "a" : "" }:${emj.name}:${emj.id}` : prevRoleEmoji, reactor.id).catch(() => { /* Do Nothing */ })
    //     }
    //   }
    // }

    const removeRole = ():void => {
      reactor.removeRole(role.id, "RR Menu").catch(() => { /* Do Nothing */ })
    }
    const handleUnique = ():void => {
      const member = guild.members.get(reactor.id)
      const reactorPrevRoles = member.roles.filter(r => Array.from(rrMenu.roles.values()).includes(r))
      if (reactorPrevRoles[0]) {
        yua.client.removeMessageReaction(message.channel.id, message.id, emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name, member.id).catch(() => { /* Do Nothing */ })
      } else {
        addRole()
      }
    }
    const handleLimited = ():void => {
      const member = guild.members.get(reactor.id)
      const reactorPrevRoles = member.roles.filter(r => Array.from(rrMenu.roles.values()).includes(r))
      if (reactorPrevRoles.length >= rrMenu.limit) {
        yua.client.removeMessageReaction(message.channel.id, message.id, emoji.id ? `${ emoji.animated ? "a" : "" }:${emoji.name}:${emoji.id}` : emoji.name, member.id).catch(() => { /* Do Nothing */ })
      } else {
        addRole()
      }
    }

    switch(rrMenu.type) {
    case 'add':
      addRole()
      break
    case 'remove':
      removeRole()
      break
    case 'unique':
      handleUnique()
      break
    case 'binding':
      addRole()
      break
    case 'limited':
      handleLimited()
      break
    }
  }
