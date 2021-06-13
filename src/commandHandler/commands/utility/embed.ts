/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import {
  getEmbedJson,
} from '../../../utils'
import {
  colors,
} from '../../../config'
class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("embed", {
      usage: "<JSON>",
      description: "Send an embedded message. Use https://embedbuilder.yua.gg/ to make your message!",
      category: "utility",
      aliases: [],
      userPermissions: [
        "manageMessages",
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
      ],
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      send,
      embed,
    } = props

    getEmbedJson(props.message, props.args.join(" "))
      .then((res) => {
        send(res as any)
      })
      .catch((err) => {
        let error: string
        if (err.failedToDownloadFile) {
          error = "Failed to download file"
        } else if (err.toolarge) {
          error = "Embed total size must not exceed 6000 characters"
        } else {
          error = err.err
        }
        embed({
          "color": colors.error,
          "description": `\`\`\`${error}\`\`\``,
          "title": "Error Occured When Trying To Create Embed",
          "footer": {
            "text": "Consider Using https://embedbuilder.yua.gg/ to make your embed!",
          },
        })
      })
      
    return
  }
}

export = YuaCommand
