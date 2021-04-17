export interface YuaConfigInterface {
  ownerGuildFaultPeriod: number
  statsEnabled: boolean
  statsChannelID: string
  statsMessageID: string
  donoRoles: Record<string, number>
  devs: string[]
}
