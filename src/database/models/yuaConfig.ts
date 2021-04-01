import {
  Schema,
  model,
  Model,
  Document,
} from 'mongoose'

interface yuaConfig extends Document {
  dummyID: 1
  ownerGuildFaultPeriod: number
  statsCluster: number
  statsEnabled: boolean
  statsChannelID: string
  statsMessageID: string
  donoRoles: Record<string, number>
}

const schema: Schema = new Schema({
  dummyID: Number, // Acts as a quick way to find and update the document, will always be 1
  ownerGuildFaultPeriod: Number,
  statsCluster: Number,
  statsEnabled: Boolean,
  statsChannelID: String,
  statsMessageID: String,
  defaultColor: String,
  errorColor: String,
  successColor: String,
  infoColor: String,
  donoRoles: Object,
}, { versionKey: false })

const schemaModel: Model<yuaConfig> = model('yua-config', schema, 'yua-config')

export default schemaModel
