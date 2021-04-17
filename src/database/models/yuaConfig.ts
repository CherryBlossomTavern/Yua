import {
  Schema,
  model,
  Model,
  Document,
} from 'mongoose'
import {
  defaultDevs,
} from '../../config'


interface yuaConfig extends Document {
  dummyID: 1
  ownerGuildFaultPeriod: number
  statsEnabled: boolean
  statsChannelID: string
  statsMessageID: string
  donoRoles: Record<string, number>
  devs: string[]
}

const schema: Schema = new Schema({
  dummyID: {
    type: Number,
    default: 1,
  }, // Acts as a quick way to find and update the document, will always be 1
  ownerGuildFaultPeriod: {
    type: Number,
    default: null,
  },
  statsEnabled: {
    type: Boolean,
    default: false,
  },
  statsChannelID: {
    type: String,
    default: null,
  },
  statsMessageID: {
    type: String,
    default: null,
  },
  donoRoles: {
    type: Object,
    default: null,
  },
  devs: {
    type: Array,
    default: defaultDevs,
  },
}, { versionKey: false })

const schemaModel: Model<yuaConfig> = model('yua-config', schema, 'yua-config')

export default schemaModel
