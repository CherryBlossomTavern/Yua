import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import {
  inviteRedirect,
} from '../../../config'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("invite", {
      usage: "",
      description: "Get a link to invite me to your server",
      category: "utility",
      aliases: [
        'link',
        'join',
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
      quickEmbed,
    } = props

    quickEmbed(undefined, `Thankyou for considering me and requesting to invite me to join you on your adventures!\nYou can invite me with this [link](https://discord.com/oauth2/authorize?client_id=${this.yua.client.user.id}&scope=bot&permissions=8&redirect_uri=${inviteRedirect})`)

    return
  }
}

export = YuaCommand
