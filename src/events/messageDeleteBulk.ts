import {
  Message,
} from 'eris'
import { ReactionRole } from '../database/models'

import Yua from 'src/client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (yua: Yua) => (msgs: Message[]): void => {
  const guildId = msgs[0].guildID

  if (!guildId) return
  ReactionRole.deleteMany({
    guildId,
    messageId: { $in: msgs.map(m => m.id) }, 
  })
    .then(() => { /* Do Nothing */ })
    .catch(() => { /* Do Nothing */ })
}
