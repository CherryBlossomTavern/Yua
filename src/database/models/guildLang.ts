import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'
import langConfig from '../../resources/Yua-Translations/config.json'

interface ownerGuild extends Document {
  guildID: string
  locale: string
}

const schema: Schema = new Schema({
  guildID: {
    type: String,
    required: true,
  },
  locale: {
    type: String,
    default: langConfig.default,
  },
}, { versionKey: false })

const schemaModel: Model<ownerGuild> = model('guild-lang', schema, 'guild-lang')

export default schemaModel
