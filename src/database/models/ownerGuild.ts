import {
  Schema,
  model,
  Document,
  Model,
} from 'mongoose'

interface ownerGuild extends Document {
  dummyID: 1
  guild: import('../../@types').SimpleErisGuildJSON
  lastUpdated: number
}

const schema: Schema = new Schema({
  dummyID: Number, // Acts as a quick way to find and update the document, will always be 1
  guild: JSON,
  lastUpdated: Number,
}, { versionKey: false })

const schemaModel: Model<ownerGuild> = model('owner-guild', schema, 'owner-guild')

export default schemaModel
