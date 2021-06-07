import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { YuaConfig } from '../../../database/models'
import { colors } from "../../../config"

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("setupstats", {
      usage: "",
      description: "Setup Yua Master Stats",
      category: "developer",
      aliases: [],
      type: 'all', // Not Yet Implemented
      devOnly: true,
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
      embed,
      deleteMessage,
    } = props
    embed({
      color: colors.info,
      description: "Setting Up Stats Message...",
    }).then(m => {
      YuaConfig.findOneAndUpdate({ dummyID: 1 }, {
        statsEnabled: true,
        statsMessageID: m.id,
        statsChannelID: m.channel.id, 
      }, { new: true }).then(update => {
        this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
      })
    })
    setTimeout(() => {
      deleteMessage()
    }, 1000)
  }
}

export = YuaCommand
