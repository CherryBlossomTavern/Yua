import {
  Message,
} from 'eris'
import {
  boostMessageTypes,
} from '../config'

import Yua from 'src/client'

export default (yua: Yua) => (msg: Message): void => {
  yua.commandHandler.parseCommand(msg)

  if (boostMessageTypes.includes(msg.type)) {
    // This means message is of type boost
  }
}
