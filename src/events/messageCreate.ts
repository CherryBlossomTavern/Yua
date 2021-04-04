import {
  Message,
} from 'eris'

import Yua from '../client'

export default (yua: Yua) => (msg: Message): void => {
  yua.commandHandler.parseCommand(msg)
}
