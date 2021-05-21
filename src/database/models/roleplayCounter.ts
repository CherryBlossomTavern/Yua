import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'

interface roleplayCounter extends Document {
  userId: string
  roleplay: Record<string, { sent: number, recieved: number, want: number }>
}

const schema: Schema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  roleplay: Object,
}, { versionKey: false })

const schemaModel: Model<roleplayCounter> = model('roleplay', schema, 'roleplay')

export default schemaModel
