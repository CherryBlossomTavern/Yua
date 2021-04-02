import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
class YuaCommand extends BaseCommand {
  private yua: import('../../../client')
  constructor(yua: import('../../../client')) {
    super("commandName", {
      usage: "",
      description: "",
      category: "",
      aliases: [],
      permissions: [], // Not Yet Implemented
      type: 'all', // Not Yet Implemented
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    if (!props.args[0]) return
    
  }
}

export default YuaCommand
