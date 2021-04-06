import { BaseCommand } from '../..'
import { CommandProps } from '../../../@types'
import Yua from '../../../client'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("masterconfig", {
      usage: "",
      description: "Change/View Yuas master configuration",
      category: "developer",
      aliases: ["mscf"],
      devOnly: true,
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    props.message.channel.createMessage("Nobuuuuu uwu do this later OvO")
    //this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: null })
    
  }
}

export = YuaCommand
