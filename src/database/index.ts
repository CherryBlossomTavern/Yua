import mongoose from 'mongoose'
const options: mongoose.ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}

export default mongoose.connect(process.env.MONGO_CONNECT_URL, options)
