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
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      send,
    } = props

    send(`<3\nhttps://discord.com/oauth2/authorize?client_id=${this.yua.client.user.id}&scope=bot&permissions=8&redirect_uri=${inviteRedirect}`)

    return
  }
}

export = YuaCommand
