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
  SimpleErisGuildJSON,
  ErisGuildJSON,
  YuaConsole,
} from './@types'

import * as console from './logs'
import { default as yua } from './yua'
import { CommandHandler } from './commandHandler'

class Yua extends Base {
  public readonly statsCluster: number = parseInt(process.env.STATS_CLUSTER)
  public readonly fetchOwnerGuild: boolean = process.env.FETCH_OWNER_GUILD === 'true'
  public readonly ownerGuildID: string = process.env.OWNER_GUILD_ID
  private _ownerGuild: SimpleErisGuildJSON = null
  private _started = false
  private _config: YuaConfigInterface = null
  private _console = console
  private _YuaStats: YuaStats = null
  private _CommandHandler: CommandHandler = null
  constructor(props: BaseClassProps) {
    super(props)
  }
  get ownerGuild(): SimpleErisGuildJSON {
    return this._ownerGuild
  }
  get config(): YuaConfigInterface {
    return this._config
  }
  get console(): YuaConsole {
    return this._console
  }
  get yuaStats(): YuaStats {
    return this._YuaStats
  }
  get commandHandler(): CommandHandler {
    return this._CommandHandler
  }

  /**
   * Dont use this, it is called by yuasharder to start yua, but we are using it to get the owner guild
   * @summary Never Call This Manually
   */
  public async init(): Promise<void> {
    if (!this._started) {
      console.custom('YUA_LOG', 'magenta', `Logged in as ${this.client.user.username}#${this.client.user.discriminator}`)

      this.getConfig().then((res) => {
        this._config = res

        if (this.clusterID === this.statsCluster) this._YuaStats = new YuaStats(this)

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
    if (!this._started) {
      this._started = true
      
      if (this.ownerGuild) {
        console.custom('YUA_DEBUG', 'gray', "Owner Guild Recieved:", this.ownerGuild.id)
      } else {
        console.custom('YUA_WARN', 'yellow', "Yua started but no owner guild, most likely probability: fetchOwnerGuild disabled or no owner guild ID")
      }

      console.log('Attempting Command Register')
      this._CommandHandler = new CommandHandler(this)
      this._CommandHandler.autoRegisterAll().then((res) => {
        if (!res) {
          throw new Error("Command Register Failed")
        } else {
          console.success(`Commands Registered`)
          yua(this)
        }
      })
    }
  }

  private registerIPCEvents(): void {

    this.ipc.register("OWNER_GUILD_UPDATE", ({ msg }) => {
      this._ownerGuild = msg.guild
      //console.log("Recieved Owner Guild Update")
      if (!this._started) {
        this.startYua()
      }
    })

    this.ipc.register("YUA_CONFIG_UPDATED", ({ msg }) => {
      this._config = msg.config
      //console.log("Yua Config Updated:::", "statsEnabled:", msg.config.statsEnabled)
    })

    this.ipc.register("FORCE_OWNER_GUILD_UPDATE", () => {
      this.updateOwnerGuildInDatabaseAndIPC()
    })

  }
  /**
   * Get Fresh Config Copy From Database
   * @returns 
   */
  public getConfig(): Promise<YuaConfigInterface> {
    return new Promise((resolve) => {
      YuaConfig.findOne({ dummyID: 1 }).then((res) => {
        if (!res) {
          YuaConfig.create({})
            .then(() => {
              this.getConfig().then(res => {
                resolve(res)
              })
            })
        } else {
          resolve(res)
        }
      })
    })
  }

  //\\//\\ Fetching Owner Guild Stuff //\\//\\

  private attemptFetchOwnerGuild(): void {
    if (this.fetchOwnerGuild) {
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
            this._ownerGuild = res.guild
            this.startYua()
          }
        })
      }
    }
  }

  /**
   * Fetch Most Recent Version of Owner Guild In Cache And Update In Database/Emit IPC Event
   */
  private updateOwnerGuildInDatabaseAndIPC(): void {
    const guild = this.getSimpleGuildJSON(this.ownerGuildID)
    if (guild) {
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
  }

  /**
   * Forcefully Fetch New Copy Of Owner Guild And Update Across All Clusters
   */
  public forceUpdateOwnerGuild(): void {
    this.ipc.broadcast("FORCE_OWNER_GUILD_UPDATE", {})
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

  /**
   * Returns Simple Guild JSON
   * @param guildID Guild Snowfalke
   * @returns 
   */
  public getSimpleGuildJSON(guildID: string): SimpleErisGuildJSON {
    const guild: ErisGuildJSON = JSON.parse(JSON.stringify(this.client.guilds.get(guildID).toJSON()))
    if (!guild) return undefined

    return JSON.parse(
      JSON.stringify({
        id: guild.id,
        banner: guild.banner,
        description: guild.description,
        features: guild.features,
        icon: guild.icon,
        memberCount: guild.memberCount,
        name: guild.name,
        ownerID: guild.ownerID,
        premiumSubscriptionCount: guild.premiumSubscriptionCount,
        premiumTier: guild.premiumTier,
        splash: guild.splash,
        vanityURL: guild.vanityURL,
        verificationLevel: guild.verificationLevel,
        roles: Array.from(Object.values(guild.roles)),
        members: Array.from(Object.values(guild.members).map(member => ({
          id: member.id,
          joinedAt: member.joinedAt,
          nick: member.nick,
          roles: member.roles,
          user: member.user,
        }))),
        emojis: guild.emojis,
        channels: Array.from(Object.values(guild.channels).map(channel => ({
          id: channel.id,
          type: channel.type,
          name: channel.name,
          parentID: channel.parentID,
          bitrate: channel.bitrate,
          userLimit: channel.userLimit,
          lastMessageID: channel.lastMessageID,
          lastPinTimestamp: channel.lastPinTimestamp,
          rateLimitPerUser: channel.rateLimitPerUser,
          topic: channel.topic,
          position: channel.position,
          permissionOverwrites: Array.from(Object.values(channel.permissionOverwrites)),
        }))),
      }),
    )
  }
}

export = Yua
