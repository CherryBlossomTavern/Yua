import Eris from 'eris'

export type ErisPermissions = (
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
)

export interface CommandExtra {
  usage?: string
  description?: string
  category?: string
  aliases?: string[]
  userPermissions?: ErisPermissions[]
  yuaPermissions?: ErisPermissions[]
  devOnly?: boolean
  /**
   * We will only support guild
   * @deprecated
   */
  type?: 'dm' | 'guild' | 'all'
}

export interface CommandProps {
  message: Eris.Message
  args: string[]
  guild: Eris.Guild
  yuaMember: Eris.Member
  /**
   * Helper function for creating messages
   * 
   * Errors are caught and only thrown if NODE_ENV=development
   */
  send(content: string | { embed: Eris.EmbedOptions }): Promise<Eris.Message>
  /**
   * Helper function to create embed message
   * 
   * Errors are caught and only thrown if NODE_ENV=development
   */
  embed(options: Eris.EmbedOptions): Promise<Eris.Message>
  /**
   * Helper function to create quick embed
   * 
   * Errors are caught and only thrown if NODE_ENV=development
   */
  quickEmbed(title?: string, description?: string, color?: number): Promise<Eris.Message>
  /**
   * Verify member has permissions both globally and in channel
   */
  checkIfHasPerms(channel: Eris.AnyGuildChannel, member: Eris.Member, permissions: ErisPermissions[]): { hasPerms: boolean, missingPerm: ErisPermissions }
  /**
   * Helper function to delete message that triggered command execution
   * 
   * Errors are caught and only thrown if NODE_ENV=development
   */
  deleteMessage(reason?: string): void
}
