import Eris from 'eris'
export interface CommandExtra {
  usage?: string
  description?: string
  category?: string
  aliases?: string[]
  permissions?: (
    "createInstantInvite" |
    "kickMembers" |
    "banMembers" |
    "administrator" |
    "manageChannels" |
    "manageGuild" |
    "addReactions" |
    "viewAuditLog" |
    "viewAuditLogs" |
    "voicePrioritySpeaker" |
    "voiceStream" |
    "stream" |
    "viewChannel" |
    "readMessages" |
    "sendMessages" |
    "sendTTSMessages" |
    "manageMessages" |
    "embedLinks" |
    "attachFiles" |
    "readMessageHistory" |
    "mentionEveryone" |
    "useExternalEmojis" |
    "externalEmojis" |
    "viewGuildInsights" |
    "voiceConnect" |
    "voiceSpeak" |
    "voiceMuteMembers" |
    "voiceDeafenMembers" |
    "voiceMoveMembers" |
    "voiceUseVAD" |
    "changeNickname" |
    "manageNicknames" |
    "manageRoles" |
    "manageWebhooks" |
    "manageEmojis" |
    "useSlashCommands" |
    "voiceRequestToSpeak" |
    "allGuild" |
    "allText" |
    "allVoice" |
    "all"
  )[]
  devOnly?: boolean
  type?: 'dm' | 'guild' | 'all'
}

export interface CommandProps {
  message: Eris.Message
  args: string[]
  guild: Eris.Guild
  send(content: string | { embed: Eris.EmbedOptions }): Promise<Eris.Message>
  embed(options: Eris.EmbedOptions): Promise<Eris.Message>
  quickEmbed(title?: string, description?: string, color?: number): Promise<Eris.Message>
}
