import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import { colors } from '../../../config'
import Yua from '../../../client'
import mongoose from 'mongoose'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("ping", {
      description: "Ping my database and connections with Discord to return live latency stats!",
      category: "utility",
      aliases: ["pong"],
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
Last Heartbeat: ${new Date(lastHeartBeatSent).toLocaleTimeString()}

------ Latency ------

Websocket:  ${wsLatency}ms
Database:   ${databasePing}ms
API:        ${mEdited.editedTimestamp - m.createdAt - 100}ms
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

export = YuaCommand
