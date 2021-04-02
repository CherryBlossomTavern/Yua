//import { colors } from '../../config'
import { CommandProps } from '../../@types'
interface RPCommand {
  name: string
  description: string
  response: string
  type: number
  links: string[]
}
export const universal = async(rpCommmand: RPCommand, props: CommandProps): Promise<void> => {
  if (props) return
  switch(rpCommmand.type) {
  case 1: {

    break
  }
  case 2: {

    break
  }
  case 3: {

    break
  }
  }
}
