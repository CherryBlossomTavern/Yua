import {
  messageCreate,
} from './events'

export default (yua: import('./client')): void => {
  yua.console.info('Init Process Complete, Now Starting Event Listeners')

  yua.client.on('messageCreate', messageCreate(yua))
  
  // I write new code done for night gonna push

}
