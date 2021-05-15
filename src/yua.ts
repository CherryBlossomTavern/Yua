import {
  messageCreate,
} from './events'

export default (yua: import('./client')): void => {
  yua.console.info('Init Process Complete, Now Starting Event Listeners')

  yua.client.on('messageCreate', messageCreate(yua))
  yuaStatus(yua)
}

const yuaStatus = (yua: import('./client')): void => {
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
      yua.client.editStatus('online', {
        name: `y!help | ${guildCount} Guilds`,
        type: 0,
      })
    }, 5000)
  }, 30000)
}
