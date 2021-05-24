import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'

interface reactionRole extends Document {
  guildId: string
  channelId: string
  messageId: string
  type: 'add' | 'unique' | 'remove' | 'binding' | 'limited'
  roles: Map<string, string> // EmojiId, RoleId
  content: string
  limit: number
}

const schema: Schema = new Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  type: String,
  roles: Map,
  content: String,
  limit: Number,
}, { versionKey: false })

const schemaModel: Model<reactionRole> = model('reaction-role', schema, 'reaction-role')

export default schemaModel
