/* eslint-disable camelcase */
export interface DiscordEmbed {
  color?: string | number
  title?: string
  url?: string
  author?: {
    name: string
    icon_url?: string
    url?: string
  }
  description?: string
  thumbnail?: {
    url: string
  }
  fields?: DiscordEmbedFields[]
  image?: {
    url: string
  }
  timestamp?: Date | number
  footer?: {
    text: string
    icon_url?: string
  }
}

export interface DiscordEmbedFields {
  name: string
  value: string
  inline?: boolean
}
