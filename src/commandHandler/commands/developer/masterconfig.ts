import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import Yua from 'src/client'
import { YuaConfig } from '../../../database/models'
import { colors } from '../../../config'
class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("masterconfig", {
      usage: "",
      description: "Change/View Yuas master configuration",
      category: "developer",
      aliases: ["mscf"],
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
      message,
      args,
      embed,
      send,
      guild,
    } = props
    //props.message.channel.createMessage("Nobuuuuu uwu do this later OvO")
    //this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: null })
    if (!args[0]) {
    
      embed({
        title: "Yua Master Configuration",
        description: "*Messing with this could be potentially dangerous, be sure you know what you are doing please <3*",
        color: colors.default,
        fields: [
          {
            name: "ownerGuildFaultPeriod",
            value: `\`${this.yua.config.ownerGuildFaultPeriod}\``,
            inline: true,
          },
          {
            name: "statsEnabled",
            value: `\`${this.yua.config.statsEnabled}\``,
            inline: true,
          },
          {
            name: "statsChannelID",
            value: `\`${this.yua.config.statsChannelID}\``,
            inline: true,
          },
          {
            name: "statsMessageID",
            value: `\`${this.yua.config.statsMessageID}\``,
            inline: true,
          },
          {
            name: "donoRoles",
            value: `\`${this.yua.config.donoRoles ? Object.values(this.yua.config.donoRoles).join("`, `") : `null`}\``,
            inline: true,
          },
          {
            name: "devs",
            value: `\`${this.yua.config.devs.join("`, `")}\``,
            inline: true,
          },
        ],
      })
    } else {
      switch(args[0].toLowerCase()) {
      case 'ownerguildfaultperiod': {
        send('Soon To Come!')
        break
      }
      case 'statsenabled': {

        if (args[1]?.toLowerCase() === 'true') {
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsEnabled: true }, { new: true }).then(update => {
            this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
            send(`Successfully Updated \`statsEnabled\` to \`true\``)
          })
        } else if (args[1]?.toLowerCase() === 'false') {
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsEnabled: false }, { new: true }).then(update => {
            this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
            send(`Successfully Updated \`statsEnabled\` to \`false\``)
          })
        } else {
          send(`Invalid arg "${args[1]}", please specify "true" or "false"`)
        }

        break
      }
      case 'statschannelid': {
        if (!args[1]) {
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsChannelID: null }, { new: true }).then(update => {
            this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
            send(`Successfully Updated \`statsChannelID\` to \`null\``)
          })
        } else {
          const channelID = message.channelMentions[0] || args[1]
          const channel = guild.channels.get(channelID)
          if (channel) {
            YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsChannelID: channelID }, { new: true }).then(update => {
              this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
              send(`Successfully Updated \`statsChannelID\` to \`${channelID}\``)
            })
          } else {
            send(`Could not find the channel <#${channelID}>`)
          }
          
        }
        break
      }
      case 'statsmessageid': {
        if (!args[1]) {
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsMessageID: null }, { new: true }).then(update => {
            this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
            send(`Successfully Updated \`statsMessageID\` to \`null\``)
          })
        } else {
            
          YuaConfig.findOneAndUpdate({ dummyID: 1 }, { statsMessageID: args[1] }, { new: true }).then(update => {
            this.yua.ipc.broadcast("YUA_CONFIG_UPDATED", { config: update })
            send(`Successfully Updated \`statsMessageID\` to \`${args[1]}\``)
          })
              
            
        }
        break
      }
      case 'donoroles': {
        send('Soon To Come!')
        break
      }
      case 'devs': {
        send('Soon To Come!')
        break
      }
      }
    }
  }
}

export = YuaCommand
