import Eris from "eris"
import { ErisPermissions } from '../@types'

export const checkIfHasPerms = (channel: Eris.AnyGuildChannel, member: Eris.Member, permissions: ErisPermissions[]): { hasPerms: boolean, missingPerm: ErisPermissions } => {
  let hasPerms = true
  let missingPerm = undefined
  for (const perm of permissions) {
    if (member.permissions.has(perm)) {
      if (!channel.permissionsOf(member).has(perm)) {
        hasPerms = false
        missingPerm = perm
        break
      }
    } else {
      if (!channel.permissionsOf(member).has(perm)) {
        hasPerms = false
        missingPerm = perm
        break
      }
    }
  }

  return {
    hasPerms,
    missingPerm,
  }
}
