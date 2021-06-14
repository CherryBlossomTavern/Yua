import {
  Message,
} from 'eris'
import { ReactionRole } from '../database/models'

import Yua from 'src/client'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (yua: Yua) => (msg: Message): void => {
  if (msg.channel.type !== 0) return
  
  ReactionRole.findOneAndDelete({
    guildId: msg.guildID,
    channelId: msg.channel.id,
    messageId: msg.id, 
  })
    .then(() => { /* Do Nothing */ })
    .catch(() => { /* Do Nothing */ })
}
