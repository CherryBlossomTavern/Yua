/* eslint-disable camelcase */
import { JSONCache } from 'eris'
export interface ErisGuildJSON extends JSONCache {
  id: string
  afkChannelID: string
  afkTimeout: number
  banner: string
  defaultNotifications: 0 | 1
  description: string
  explicitContentFilter: 0 | 1 | 2
  features: string[]
  icon: string
  joinedAt: number
  large: boolean
  maxMembers: number
  memberCount: number
  mfaLevel: 0 | 1
  name: string
  ownerID: string
  preferredLocale: string
  premiumSubscriptionCount: number
  premiumTier: 0 | 1 | 2 | 3
  region: string
  splash: string
  unavailable: boolean
  vanityURL: string
  verificationLevel: 0 | 1 | 2 | 3 | 4
  channels: {
    [snowflake: string]: {
      id: string
      type: 0 | 1 | 2 | 3 | 4 | 5 | 6
      name: string
      parentID?: string
      bitrate?: number
      userLimit?: number
      voiceMembers?: unknown
      lastMessageID?: string
      lastPinTimestamp?: number
      messages?: unknown
      rateLimitPerUser?: number
      topic?: string
      permissionOverwrites: {
        [snowflake: string]: {
          id: string
          allow: number
          deny: number
          type: string
        }
      }
      position: number
    }
  }
  emojis: {
    roles: unknown
    require_colons: boolean
    name: string
    managed: boolean
    id: string
    available: boolean
    animated: boolean
  }[]
  members: {
    [snowflake: string]: {
      id: string
      game: unknown
      joinedAt: number
      nick: string
      roles: string[]
      user: {
        id: string
        avatar: string
        bot: boolean
        discriminator: string
        username: string
      }
      voiceState: {
        id: string
        channelID: string
        deaf: boolean
        mute: boolean
        selfMute: boolean
        selfDeaf: boolean
        selfStream: boolean
        sessionID: string
        suppress: boolean
      }
    }
  }
  roles: {
    [snowflake: string]: {
      id: string
      color: number
      hoist: boolean
      managed: boolean
      mentionable: boolean
      name: string
      permissions: {
        allow: number
        deny: number
      }
      position: number
    }
  }
}

export interface SimpleErisGuildJSON {
  id: string
  banner: string
  description: string
  features: string[]
  icon: string
  memberCount: number
  name: string
  ownerID: string
  premiumSubscriptionCount: number
  premiumTier: 0 | 1 | 2 | 3
  splash: string
  vanityURL: string
  verificationLevel: 0 | 1 | 2 | 3 | 4
  roles: {
    id: string
    color: number
    hoist: boolean
    managed: boolean
    mentionable: boolean
    name: string
    permissions: {
      allow: number
      deny: number
    }
    position: number
  }[]
  members: {
    id: string
    joinedAt: number
    nick: string
    roles: string[]
    user: {
      id: string
      avatar: string
      bot: boolean
      discriminator: string
      username: string
    }
  }[]
  emojis: {
    roles: unknown
    require_colons: boolean
    name: string
    managed: boolean
    id: string
    available: boolean
    animated: boolean
  }[]
  channels: {
    id: string
    type: 0 | 1 | 2 | 3 | 4 | 5 | 6
    name: string
    parentID?: string
    bitrate?: number
    userLimit?: number
    lastMessageID?: string
    lastPinTimestamp?: number
    rateLimitPerUser?: number
    topic?: string
    permissionOverwrites: {
      id: string
      allow: number
      deny: number
      type: string
    }[]
    position: number
  }[]
}
