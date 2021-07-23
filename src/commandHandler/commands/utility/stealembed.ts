/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { colors } from '../../../config'
import Eris from 'eris'
class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("stealembed", {
      usage: "[message-link]",
      description: "See an embed you like? Use this special command to steal the JSON for the embed",
      category: "utility",
      aliases: [
        'yoinkembed',
        'semb',
      ],
      userPermissions: [
        "manageMessages",
      ],
      yuaPermissions: [
        'readMessages',
        'attachFiles',
      ],
    })
    this.yua = yua
  }
  public async execute(props: CommandProps): Promise<void> {
    const {
      send,
      quickEmbed,
      args,
      message,
    } = props

    function getEmbeds(msg: Eris.Message): string[] {
      if (!msg.embeds[0]) {
        quickEmbed(undefined, "Apoloiges, but the message you referenced appears to have no embeds", colors.error)

        return []
      } else {
        const embeds: string[] = []
        for (const embed of msg.embeds) {
          delete embed.type
          embeds.push(JSON.stringify({ embed: embed }, undefined, 2))
        }

        return embeds
      }
    }
    function sendAttachments(embeds: string[], authorName: string): void {
      if (!embeds[0]) return
      const attachments: Eris.MessageFile[] = []
      for (const embed of embeds) {
        attachments.push({
          name: `${authorName}-embed-${attachments.length}.json`,
          file: Buffer.from(embed),
        })
      }
      send(undefined, attachments)
    }
    if (message.messageReference) {
      const msg = await this.yua.client.getMessage(message.messageReference.channelID, message.messageReference.messageID)
      if (msg) {
        sendAttachments(getEmbeds(msg), msg.author.username)
      } else {
        quickEmbed(undefined, "Apologies, but discord is not allowing me to retrieve that message", colors.error)
      }
    } else if (args[0]) {
      const parseLink = args[0].replace(/https:\/\/.*\/channels\//, "").split("/")
      const channelId = parseLink[1]
      const messageId = parseLink[2]
      if (!parseInt(channelId) || !parseInt(messageId)) {
        quickEmbed(undefined, "Hmm, that does not appear to be a valid message link", colors.error)

        return
      }
      const msg = await this.yua.client.getMessage(channelId, messageId)
      if (msg) {
        sendAttachments(getEmbeds(msg), msg.author.username)
      } else {
        quickEmbed(undefined, "Hmm, that does not appear to be a valid message link", colors.error)
      }

    } else {
      quickEmbed(undefined, "I can't steal an embed unless you link or reply to a message", colors.error)
    }

    return
  }
}

export = YuaCommand
