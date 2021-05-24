import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'

interface boostMessage extends Document {
  guildId: string
  channelId: string
  message: string
}

const schema: Schema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  channelId: String,
  message: String,
}, { versionKey: false })

const schemaModel: Model<boostMessage> = model('boost-message', schema, 'boost-message')

export default schemaModel
