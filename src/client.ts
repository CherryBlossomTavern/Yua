/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Base,
  BaseClassProps,
} from 'yuasharder'

import {
  YuaStats,
} from './utils'

import {
  OwnerGuild,
  YuaConfig,
} from './database/models'

import {
  YuaConfigInterface,
} from './@types'

import * as console from './logs'

class Yua extends Base {
  public fetchOwnerGuild: boolean = process.env.FETCH_OWNER_GUILD === 'true'
  public ownerGuildCluster: number = null
  public ownerGuildID: string = process.env.OWNER_GUILD_ID
  public ownerGuild: import('eris').JSONCache = null
  public started = false

  public config: YuaConfigInterface

  public YuaStats: YuaStats = null
  constructor(props: BaseClassProps) {
    super(props)
  }

  /**
   * Dont use this, it is called by yuasharder to start yua, but we are using it to get the owner guild
   * @summary Never Call This Manually
   */
  public async init(): Promise<void> {
    if (!this.started) {
      console.custom('YUA', 'magenta', `Logged in as ${this.client.user.username}#${this.client.user.discriminator}`)

      this.getConfig().then((res) => {
        this.config = res

        if (this.clusterID === this.config.statsCluster) this.YuaStats = new YuaStats(this)

        this.registerIPCEvents()

        if (this.fetchOwnerGuild && this.ownerGuildID) {
          this.eventListenersForClusterWithOwnerGuild()
          this.attemptFetchOwnerGuild()
        } else {
          this.startYua()
        }
      })
    }
  }

  /**
   * This is the actual method you should use for starting bot code
   * @summary Basically clients ready event
   * @summary Never Call This Manually
   */
  public startYua(): void {
    if (!this.started) {
      this.started = true
    
      if (this.ownerGuild) {
        console.custom('YUA_DEBUG', 'gray', "Owner Guild Recieved:", this.ownerGuild.id)
      } else {
        console.custom('YUA_WARN', 'yellow', "Yua started but no owner guild, most likely probability: fetchOwnerGuild disabled or no owner guild ID")
      }
    }
  }

  private registerIPCEvents(): void {

    this.ipc.register("OWNER_GUILD_UPDATE", ({ msg }) => {
      this.ownerGuild = msg.guild
      //console.log("Recieved Owner Guild Update")
      if (!this.started) {
        this.startYua()
      }
    })

    this.ipc.register("YUA_CONFIG_UPDATED", ({ msg }) => {
      this.config = msg.config
      //console.log("Yua Config Updated:::", "statsEnabled:", msg.config.statsEnabled)
    })
    
  }

  public getConfig(): Promise<YuaConfigInterface> {
    return new Promise((resolve) => {
      YuaConfig.findOne({ dummyID: 1 }).then((res) => {
        if (!res) {
          YuaConfig.create({
            ownerGuildFaultPeriod: null,
            statsCluster: 0,
            statsEnabled: false,
            statsChannelID: null,
            statsMessageID: null,
            donoRoles: {},
            dummyID: 1,
          }).then((res) => {
            resolve(res)
          })
        } else {
          resolve(res)
        }
      })
    })
  }

  //\\//\\ Fetching Owner Guild Stuff //\\//\\

  private attemptFetchOwnerGuild(): void {
    if (this.fetchOwnerGuild && (!this.ownerGuildCluster || this.ownerGuildCluster === this.clusterID)) {
      const guild = this.client.guilds.get(this.ownerGuildID)
      if (guild) {
        guild.fetchAllMembers().then(() => {
          this.updateOwnerGuildInDatabaseAndIPC()
        })
      } else {
        OwnerGuild.findOne({ dummyID: 1 }).then((res) => {
          if (!res) {
            console.error(new Error("Failed To Fetch Owner Guild From Mongo... This Cluster Will Not Be Active Until IPC 'OWNER_GUILD_UPDATE'"))
          } else {
            // @ts-expect-error
            this.ownerGuild = res.guild
            this.startYua()
          }
        })
      }
    }
  }

  /**
   * Fetch Most Recent Version of Owner Guild In Cache And Update In Database/Emit IPC Event
   */
  public updateOwnerGuildInDatabaseAndIPC(): void {
    const guild = JSON.parse(JSON.stringify(this.client.guilds.get(this.ownerGuildID).toJSON()))
    OwnerGuild.findOne({ dummyID: 1 }).then(res => {
      if (!res) {
        OwnerGuild.create({
          dummyID: 1,
          guild: guild,
          lastUpdated: Date.now(),
        })
      } else {
        res.updateOne({
          guild: guild,
          lastUpdated: Date.now(),
        })
      }
    })
    this.ipc.broadcast("OWNER_GUILD_UPDATE", { guild: guild })
  }
  private eventListenersForClusterWithOwnerGuild(): void {
    this.client.on('guildMemberUpdate', (guild, member, oldmember) => {
      if (guild.id === this.ownerGuildID) {
        if (new String(oldmember.roles.join("")).toString() !== new String(member.roles.join("")).toString()) {
          //console.info('Roles changed, updating guild in database')
          this.updateOwnerGuildInDatabaseAndIPC()
        }
      }
    })
  }
  /**
   * @deprecated
   */
  private ownerGuildFaultInterval(): void {
    if (this.config.ownerGuildFaultPeriod) {
      setInterval(() => {
        this.attemptFetchOwnerGuild()
      }, this.config.ownerGuildFaultPeriod)
    }
  }
}

export = Yua
