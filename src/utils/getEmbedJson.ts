/* eslint-disable @typescript-eslint/no-unused-vars */
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

export const getEmbedJson = async (message: Eris.Message, cleanContent: string): Promise<YuaEmbed> => {
  return new Promise((resolve, reject) => {
    try {
      if (message.attachments[0]) {
        request.get(message.attachments[0].url, (err, res) => {
          if (err) {
            reject({
              failed: true,
              toolarge: false,
              invalid: false,
              err,
            })
          }
          try {
            if (new String(res.body).length > 6000) {
              reject({
                failed: false,
                toolarge: true,
                invalid: false,
              })
            }
            const emb = JSON.parse(res.body)
            resolve(emb)
          } catch (err) {
            reject({
              failed: false,
              toolarge: false,
              invalid: true,
              err,
            })
          }
        })
      } else {
        const emb = JSON.parse(cleanContent)
        resolve(emb)
      }
    } catch (err) {
      reject({
        failed: false,
        toolarge: false,
        invalid: true,
        err,
      })
    }
  })
}

/**
 * Dont Use
 * @deprecated
 */
const sendError = (props: CommandProps, err: unknown): void => {
  props.send({
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
