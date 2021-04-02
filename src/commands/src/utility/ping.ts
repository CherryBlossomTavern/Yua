import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import { colors } from '../../../config'
import mongoose from 'mongoose'
class YuaCommand extends BaseCommand {
  private yua: import('../../../client')
  constructor(yua: import('../../../client')) {
    super("ping", {
      usage: "",
      description: "Ping my database, and connections with Discord to return live latency stats!",
      category: "utility",
      aliases: ["pong"],
      permissions: [], // Not Yet Implemented
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public async execute(props: CommandProps): Promise<void> {
    const {
      message,
    } = props
    
    const clusterID = this.yua.clusterID
    const shardID = this.yua.client.guildShardMap[message.guildID]
    const shard = this.yua.client.shards.get(shardID)
    const wsLatency = shard.latency
    const lastHeartBeatReceived = shard.lastHeartbeatReceived
    const lastHeartBeatSent = shard.lastHeartbeatSent
    const status = shard.status
    const databasePing = await this.getDatabasePing()

    message.channel.createMessage({
      embed: {
        color: colors.info,
        description: "Pinging...",
      },
    })
      .then(m => {
        m.edit({
          embed: {
            color: colors.success,
            description: "Success!",
          },
        })
          .then(mEdited => {
            setTimeout(() => {
              mEdited.edit({
                embed: {
                  color: colors.default,
                  title: 'Pong! :ping_pong:',
                  description: `\`\`\`nim
------ General ------

Cluster ID: ${clusterID}
Shard ID: ${shardID}
Status: "${status}"

------- Shard -------

Last Heartbeat Recieved: ${new Date(lastHeartBeatReceived).toLocaleTimeString()}
Last Heartbeat Sent: ${new Date(lastHeartBeatSent).toLocaleTimeString()}

------ Latency ------

Websocket: ${wsLatency}ms
Database:  ${databasePing}ws
API:  ${m.editedTimestamp - m.timestamp}ws

---------------------
\`\`\``,
                },
              })
            }, 500)
          })
      })
  }
  private async getDatabasePing(): Promise<number> {
    const time = Date.now()
    await mongoose.connection.db.admin().ping()

    return Date.now() - time
  }
}

export default YuaCommand
