import {
  inviteRedirect,
} from '../config'
import Eris from 'eris'
const {
  GatewayOPCodes,
} = Eris.Constants

// Causes large ping pong event between all clusters to get guild count
export const yuaStatus = (yua: import('../client')): void => {
  let guildCount: number = null
  yua.ipc.register('GET_GUILD_COUNT', ({ msg }) => {
    yua.ipc.sendTo(msg.cluster, 'GET_GUILD_COUNT_RESPONSE', { guilds: yua.client.guilds.size })
  })
  yua.ipc.register('GET_GUILD_COUNT_RESPONSE', ({ msg }) => {
    guildCount += msg.guilds
  })
  yua.ipc.broadcast('GET_GUILD_COUNT', { cluster: yua.clusterID })
  setInterval(() => {
    guildCount = 0
    yua.ipc.broadcast('GET_GUILD_COUNT', { cluster: yua.clusterID })
    setTimeout(() => {
      updateStatus(yua, guildCount)
    }, 5000)
  }, 30000)
}
// Updates status using ws directly incase of button update for bots
const updateStatus = (yua: import('../client'), guildCount: number): void => {
  for (const [, shard] of yua.client.shards.entries()) {
    shard.sendWS(GatewayOPCodes.STATUS_UPDATE, {
      since: shard.presence.status === 'idle' ? Date.now() : 0,
      status: 'online',
      afk: false,
      activities: [
        {
          name: `y!help | ${guildCount} Guilds`,
          type: 0,
          buttons: [
            {
              label: "Invite Me!",
              url: `https://discord.com/oauth2/authorize?client_id=${yua.client.user.id}&scope=bot&permissions=8&redirect_uri=${inviteRedirect}`,
            },
          ],
        },
      ],
    })
  }
}
