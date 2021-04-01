import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'
import { prefixesRegexpString } from '../../config'

interface prefix extends Document {
  guildID: string
  prefixes: string
}

const schema: Schema = new Schema({
  guildID: {
    type: String,
    required: true,
  },
  prefixes: {
    type: String,
    default: prefixesRegexpString,
  },
}, { versionKey: false })

const schemaModel: Model<prefix> = model('prefix', schema, 'prefix')

export default schemaModel
