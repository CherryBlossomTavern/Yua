import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from '../../../client'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("commandName", {
      usage: "",
      description: "",
      category: "",
      aliases: [],
      permissions: [],
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    if (!props.args[0]) return
    
  }
}

export = YuaCommand
