/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  messageCreate,
  messageReactionAdd,
  messageReactionRemove,
  messageReactionRemoveAll,
  messageReactionRemoveEmoji,
} from './events'
import {
  yuaStatus,
} from './utils'

export default (yua: import('./client')): void => {
  yua.console.info('Init Process Complete, Now Starting Event Listeners')
  // Start Event Listeners
  eventListeners(yua)
  // Start Status update 
  yuaStatus(yua)
}

const eventListeners = (yua: import('./client')): void => {
  yua.client.on('messageCreate', messageCreate(yua))
  yua.client.on('messageReactionAdd', messageReactionAdd(yua))
  yua.client.on('messageReactionRemove', messageReactionRemove(yua))
  yua.client.on('messageReactionRemoveAll', messageReactionRemoveAll(yua))
  yua.client.on('messageReactionRemoveEmoji', messageReactionRemoveEmoji(yua))
}
