import {
  MasterStats,
} from "yuasharder"
import {
  DiscordEmbed,
  DiscordEmbedFields,
} from '../@types'
import {
  AxiosResponse,
  default as axios,
} from 'axios'

import { colors } from '../config'
import { YuaConfig } from '../database/models'

const backupEmbed: DiscordEmbed = {
  title: "Stats Embed Error",
  description: "Discord responded with a failure code when trying to update stats message!\n\`\`\`Stats has been disabled automatically, please redo stats message setup or config a new message id and re-enable\`\`\`",
  color: colors.error,
}

export class YuaStats {
  private Yua: import('../client')
  private _retryCount = 0
  private _retryTimeout = 2000
  public maxRetrys = 5
  constructor(Yua: import('../client')) {
    this.Yua = Yua
    if (process.env.NODE_ENV !== 'production') {
      this.Yua.console.warn('NODE_ENV not in production, disabling stats updater')
      
      return
    }
    this.Yua.ipc.register('stats', (message) => {
      if (this.Yua.config.statsEnabled && this.Yua.config.statsChannelID) {
        this.sendStats(message.msg, this.Yua.config.statsChannelID, this.Yua.config.statsMessageID)
      }
    })
  }

  public sendStats(stats: MasterStats, channelID: string, messageID: string): void {
    const embed = this.embedStats(stats)
    this.makeRequest('patch', `https://discord.com/api/v8/channels/${channelID}/messages/${messageID}`, embed)
      .then(() => {
        this._retryCount = 0
      })
      .catch((err) => {
        if (this._retryCount = this.maxRetrys) {
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsEnabled: false }, { new: true })
            .then((res) => {
              this.Yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: res })
              this.makeRequest('post', `https://discord.com/api/v8/channels/${channelID}/messages`, backupEmbed)
                .catch(err)
            })
            .catch((err) => { throw err })
        } else {
          setTimeout(() => {
            this.sendStats(stats, channelID, messageID)
            this._retryCount ++
          }, this._retryTimeout)
        }
      })
  }

  public embedStats(stats: MasterStats): DiscordEmbed {
    stats.ram = stats.ram / 1000000

    const embed: DiscordEmbed = {
      color: colors.default,
      title: "My Live Stats <3",
      description: `\`\`\`Total Guilds: ${stats.guilds}\nTotal Users: ${stats.users}\nTotal Ram: ${Math.round(stats.ram)}mb\nTotal Clusters: ${stats.clusters.length}\`\`\``,
      thumbnail: {
        url: this.Yua.client.user.avatarURL,
      },
      fields: [],
      footer: {
        text: `Last Updated: ${new Date().toTimeString()}`,
      },
    }

    // Placeholder
    const clusters = []

    // Basically loops through and sorts out which clusters have not started yet and assigns them a cluster id
    // Have to do this because yuasharder does not assign cluster id until shards queued are sent to cluster
    for (const cluster of stats.clusters) {
      if (cluster.clusterID === 0 && !cluster.uptime) {

        for (let i = 0; i < stats.clusters.length; i++) {
          if (!stats.clusters.find(c => c.clusterID === i) && !clusters.includes(i)) {
            clusters.push(i)
            embed.fields.push({
              name: `<:d_:832766028010094604> Cluster ${i}`,
              value: `\`Awaiting Shards...\``,
              inline: true,
            })
            break
          }
        }

      } else {

        embed.fields.push({
          name: `<:o_:832766028488245278> Cluster ${cluster.clusterID}`,
          value: `\`\`\`Guilds: ${cluster.guilds}\nUsers: ${cluster.users}\nRam: ${Math.round(cluster.ram)}mb\nUptime: ${Math.round(Math.round(cluster.uptime / 1000) / 60)}m\nShards: ${cluster.shards}\`\`\``,
          inline: true,
        })

      }
    }

    embed.fields.sort(this.sortClusters)

    return embed
  }
  
  public sortClusters(a: DiscordEmbedFields, b: DiscordEmbedFields): number {
    if (parseInt(a.name.replace(/<.*>/, "").replace(/\D+/g, "")) < parseInt(b.name.replace(/<.*>/, "").replace(/\D+/g, ""))) {
      return -1
    }
    if (parseInt(a.name.replace(/<.*>/, "").replace(/\D+/g, "")) > parseInt(b.name.replace(/<.*>/, "").replace(/\D+/g, ""))) {
      return 1
    }

    return 0
  }

  public makeRequest(method: "get" | "post" | "patch" | "delete", url: string, embed?: DiscordEmbed): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios({
        method,
        url,
        headers: {
          "Authorization": this.Yua.client.token,
          "Content-Type": "application/json",
        },
        data: {
          embed,
        },
      })
        .then((res) => {
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
      
  }

}
