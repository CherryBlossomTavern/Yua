import Eris from 'eris'
import { CommandProps } from 'src/@types'
import request from 'request'
import {
  colors,
} from '../config'

export interface YuaEmbed {
  content?: string
  embed?: Eris.EmbedOptions
}

export const getEmbedJson = async (commandProps: CommandProps): Promise<YuaEmbed> => {
  const {
    args,
    message,
  } = commandProps

  return new Promise((resolve, reject) => {
    try {
      if (message.attachments[0]) {
        request.get(message.attachments[0].url, (err, res) => {
          if (err) {
            sendError(message, "Failed To Download File")
            reject("Failed")
          }
          try {
            if (new String(res.body).length > 6000) {
              sendError(message, "Total Embed Size Must Not Exceed 6000 Characters!")
              reject("Failed")
            }
            const emb = JSON.parse(res.body)
            resolve(emb)
          } catch (err) {
            sendError(message, err)
            reject("Failed")
          }
        })
      } else {
        const emb = JSON.parse(args.join(" "))
        resolve(emb)
      }
    } catch (err) {
      sendError(message, err)
      reject("Failed")
    }
  })
}

const sendError = (msg: Eris.Message, err: unknown): void => {
  msg.channel.createMessage({
    "embed": {
      "color": colors.error,
      "description": `\`\`\`${err}\`\`\``,
      "title": "Error Occured When Trying To Create Embed",
      "footer": {
        "text": "Consider Using https://embedbuilder.yua.gg/ to make your embed!",
      },
    },
  })
}
