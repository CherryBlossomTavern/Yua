import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'

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
    const {} = props

    return
  }
}

export = YuaCommand
