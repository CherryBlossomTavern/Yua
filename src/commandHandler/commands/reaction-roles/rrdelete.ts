import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { ReactionRole } from '../../../database/models'
import { colors } from '../../../config'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("rrdelete", {
      usage: "<message-id>",
      description: "Delete a reaction role menu",
      category: "reaction-roles",
      aliases: [
        'rrd',
        'reactionroledelete',
      ],
      userPermissions: [
        'manageRoles',
      ],
      yuaPermissions: [
        'readMessages',
        'sendMessages',
        'embedLinks',
        'manageMessages',
        'addReactions',
        'manageRoles',
      ],
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      quickEmbed,
      args,
      guild,
    } = props

    if (!args[0]) {
      quickEmbed(undefined, "I need the message id of reaction role menu to delete it silly", colors.error)

      return
    } else {
      ReactionRole.findOneAndDelete({
        messageId: args[0],
        guildId: guild.id, 
      }).then((res) => {
        if (!res) {
          quickEmbed(undefined, "I could not find any reaction role menus for the message id given, apologies", colors.error)

          return
        }
        
        this.yua.client.deleteMessage(res.channelId, res.messageId).catch(() => { /* Do Nothing */ })
        quickEmbed(undefined, "I successfully removed the reaction role menu located in " + `<#${res.channelId}>` , colors.success)
      })
        .catch(() => { /* Do Nothing */ })
    }

    return
  }
}

export = YuaCommand
