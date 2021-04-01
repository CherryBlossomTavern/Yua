export interface YuaConfigInterface {
  ownerGuildFaultPeriod: number
  statsCluster: number
  statsEnabled: boolean
  statsChannelID: string
  statsMessageID: string
  donoRoles: Record<string, number>
}
