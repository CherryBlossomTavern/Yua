/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import {
  getEmbedJson,
} from '../../../utils'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("embed", {
      usage: "",
      description: "Send an embedded message. Use https://embedbuilder.yua.gg/ to make your message!",
      category: "utility",
      aliases: [],
      permissions: [
        "manageMessages",
      ],
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      send,
    } = props
    
    getEmbedJson(props)
      .then((res) => {
        send(res as any)
      })
      .catch(() => {})
      
    return
  }
}

export = YuaCommand
