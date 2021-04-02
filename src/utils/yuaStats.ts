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
  color: parseInt(colors.error.replace("#", "0x")),
}

export class YuaStats {
  public Yua: import('../client')
  constructor(Yua: import('../client')) {
    this.Yua = Yua
    this.Yua.ipc.register('stats', (message) => {
      if (this.Yua.yuaConfig.statsEnabled && this.Yua.yuaConfig.statsChannelID) {
        this.sendStats(message.msg, this.Yua.yuaConfig.statsChannelID, this.Yua.yuaConfig.statsMessageID)
      }
    })
  }

  public sendStats(stats: MasterStats, channelID: string, messageID: string): void {
    const embed = this.embedStats(stats)
    this.makeRequest('patch', `https://discord.com/api/v8/channels/${channelID}/messages/${messageID}`, embed)
      .catch((err) => {
        YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsEnabled: false }, { new: true })
          .then((res) => {
            this.Yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: res })
            this.makeRequest('post', `https://discord.com/api/v8/channels/${channelID}/messages`, backupEmbed)
              .catch(err)
          })
          .catch((err) => { throw err })
      })
  }

  public embedStats(stats: MasterStats): DiscordEmbed {
    stats.ram = stats.ram / 1000000

    const embed: DiscordEmbed = {
      color: parseInt(colors.default.replace("#", "0x")),
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
              name: `Cluster ${i}`,
              value: `\`Awaiting Shards...\``,
              inline: true,
            })
            break
          }
        }

      } else {

        embed.fields.push({
          name: `Cluster ${cluster.clusterID}`,
          value: `\`\`\`Guilds: ${cluster.guilds}\nUsers: ${cluster.users}\nRam: ${Math.round(cluster.ram)}mb\nUptime: ${Math.round(cluster.uptime / 1000)}s\nShards: ${cluster.shards}\`\`\``,
          inline: true,
        })

      }
    }

    embed.fields.sort(this.sortClusters)

    return embed
  }
  
  public sortClusters(a: DiscordEmbedFields, b: DiscordEmbedFields): number {
    if (parseInt(a.name.replace(/\D+/g, "")) < parseInt(b.name.replace(/\D+/g, ""))) {
      return -1
    }
    if (parseInt(a.name.replace(/\D+/g, "")) > parseInt(b.name.replace(/\D+/g, ""))) {
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
