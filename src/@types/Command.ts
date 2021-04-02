import Eris from 'eris'
export interface CommandExtra {
  usage?: string
  description?: string
  category?: string
  aliases?: string[]
  permissions?: string[]
  type?: 'dm' | 'guild' | 'all'
}
export interface CommandProps {
  message: Eris.Message
  args: string[]
  send(content: string | { embed: Eris.EmbedOptions }): Promise<Eris.Message>
  embed(options: Eris.EmbedOptions): Promise<Eris.Message>
  quickEmbed(title?: string, description?: string, color?: number): Promise<Eris.Message>
}
