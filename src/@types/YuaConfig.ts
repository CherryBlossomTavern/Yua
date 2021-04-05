export interface YuaConfigInterface {
  ownerGuildFaultPeriod: number
  statsEnabled: boolean
  statsChannelID: string
  statsMessageID: string
  roleplaySheetID: string
  donoRoles: Record<string, number>
  devs: string[]
}
