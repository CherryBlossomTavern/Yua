import { BaseCommand } from '../../'
import { CommandProps } from '../../../@types'
import { EmbedOptions } from 'eris'
import {
  colors,
  prefixes,
  categoryHelp,
  inviteRedirect,
} from '../../../config'
import Yua from 'src/client'

class YuaCommand extends BaseCommand {
  private yua: Yua
  constructor(yua: Yua) {
    super("help", {
      usage: "[section|command|alias]",
      description: "See my capabilities or get information on how to utilize something specific :3",
      category: "utility",
      aliases: [
        "commands",
        "yuafordummies",
      ],
    })
    this.yua = yua
  }
  public execute(props: CommandProps): void {
    const {
      message,
      args,
      embed,
      quickEmbed,
    } = props
    
    if (!args[0]) {
      const helpEmbed: EmbedOptions = {
        title: "Yua For Dummies",
        color: colors.default,
        description: `I hope this guide will prove useful in enhancing your knowledge on me <3\nTo get more information on a certain category or command use\n\`${prefixes[0]} help [section|command|alias]\`\n\nCommand Arguments:\n- \`[]\` is optional\n- \`<>\` is required\n- \`|\` means "OR"\n**\nDo not actually include [], <>, | symbols when using the command!**`,
        // thumbnail: {
        //   url: this.yua.client.user.avatarURL,
        // },
        fields: [],
        footer: {
          text: `Yua v${process.env.npm_package_version} | ${this.yua.commandHandler.commandsArray.length} Commands Loaded`,
        },
      }
  
      const commands = this.yua.commandHandler.commandsArray
  
      for (const cat of this.yua.commandHandler.categories) {
        if (cat === "developer") continue
        const catConfig = categoryHelp[cat]
        helpEmbed.fields.push({
          name: `${catConfig ? `${catConfig.emoji} ` : ""}${catConfig ? catConfig.name : cat.toLowerCase().charAt(0)
            .toUpperCase() + cat.toLowerCase().slice(1)} (${commands.filter(cmd => cmd.extra.category === cat).length})`,
          value: `*${catConfig ? catConfig.text : "No category description defined"}*`,
          inline: true,
        })
      }
      if (this.yua.config.devs.includes(message.author.id)) {
        helpEmbed.fields.push({
          name: `:gear: Developer (${commands.filter(cmd => cmd.extra.category === 'developer').length})`,
          value: `*Special commands my maintainers can use to debug/fix possible issues*`,
          inline: true,
        })
      }
      helpEmbed.fields.push({
        name: "Extra Links and Information",
        value: `[Invite](https://discord.com/oauth2/authorize?client_id=${this.yua.client.user.id}&scope=bot&permissions=8&redirect_uri=${inviteRedirect}) | [Website]() | [Support](https://discord.gg/yua) | [Vote](https://top.gg/bot/808779804789702696) | [Patreon](https://www.patreon.com/yuabot)`,
        inline: false,
      })
      embed(helpEmbed)

      return
    } else {
      const categories = this.yua.commandHandler.categories
      const evalUser = args[0].toLowerCase() !== 'developer' ? true : this.yua.config.devs.includes(message.author.id) ? true : false
      if (categories.includes(args[0].toLowerCase()) && evalUser) {
        const commands = Array.from(this.yua.commandHandler.filter(cmd => cmd.extra.category === args[0].toLowerCase()).values())
          .sort(this.sort)
        const catConfig = categoryHelp[args[0].toLowerCase()]
        const uppercaseCat = catConfig ? catConfig.name : args[0]
          .toLowerCase()
          .charAt(0)
          .toUpperCase() +
          args[0]
            .toLowerCase()
            .slice(1)

        let commandsDes = ""
        for (const command of commands) {
          const commandNameUppercase = command.name
            .toLowerCase()
            .charAt(0)
            .toUpperCase() +
                command.name
                  .toLowerCase()
                  .slice(1)
          //if (commandsDes.length > 0) commandsDes += "\n"

          
          const description = this.yua.langHandler.tempGetValue(command.extra.description) || command.extra.description

          
          commandsDes += `\n\n**${commandNameUppercase}**\n*${description}*${command.extra.aliases[0] ? `\n**Aliases:** \`${command.extra.aliases.join("`, `")}\`` : "" }\n**Usage:** \`${prefixes[0]} ${command.name}${command.extra.usage ? ` ${command.extra.usage}` : ""}\``
        }
  
        const catEmbed: EmbedOptions = {
          title: `Yua For Dummies | ${uppercaseCat}`,
          color: colors.default,
          description: `Here are all my **${args[0]}** commands, I hope you find what you were looking for <3\nTo get more information on a command use\n\`${prefixes[0]} help [command|alias]\`\n\nCommand Arguments:\n- \`[]\` is optional\n- \`<>\` is required\n- \`|\` means "OR"\n**\nDo not actually include [], <>, | symbols when using the command!**${commandsDes}`,
          // thumbnail: {
          //   url: this.yua.client.user.avatarURL,
          // },
          footer: {
            text: `Yua v${process.env.npm_package_version} | ${this.yua.commandHandler.commandsArray.length} Commands Loaded`,
          },
        }
        
        if (catEmbed.description.length > 2047) {
          catEmbed.description = `Here are all my **${args[0]}** commands, I hope you find what you were looking for <3\nTo get more information on a command use\n\`${prefixes[0]} help [command|alias]\`\n\nCommand Arguments:\n- \`[]\` is optional\n- \`<>\` is required\n- \`|\` means "OR"\n**\nDo not actually include [], <>, | symbols when using the command!**\n\n*It appears there are too many commands for me to display detailed info on them!*\n\n**Commands:**\n\`${commands.map(c => c.name).join("`, `")}\``
        }
        if (catEmbed.description.length > 2047) {
          catEmbed.description = `Here are all my **${args[0]}** commands, I hope you find what you were looking for <3\nTo get more information on a command use\n\`${prefixes[0]} help [command|alias]\`\n\nCommand Arguments:\n- \`[]\` is optional\n- \`<>\` is required\n- \`|\` means "OR"\n**\nDo not actually include [], <>, | symbols when using the command!**\n\n*It appears there are too many commands for me to display detailed info on them!*`
          embed(catEmbed)
          catEmbed.description = `\n\n**Commands:**\n\`${commands.map(c => c.name).join("`, `")}\``
        }
        embed(catEmbed)

        return
      } else {
        const command = this.yua.commandHandler.getByAlias(args[0].toLowerCase())
        if (command) {
          if (command.extra.category === 'developer' && !this.yua.config.devs.includes(message.author.id)) {
            quickEmbed(null, `I could not find the command, category, or alias **"${args[0]}"**`, colors.error)

            return
          }
          const catConfig = categoryHelp[command.extra.category]
          const uppercaseCat = catConfig ? catConfig.name : command.extra.category
            .toLowerCase()
            .charAt(0)
            .toUpperCase() +
              command.extra.category
                .toLowerCase()
                .slice(1)
          const commandNameUppercase = command.name
            .toLowerCase()
            .charAt(0)
            .toUpperCase() +
              command.name
                .toLowerCase()
                .slice(1)


          const description = this.yua.langHandler.tempGetValue(command.extra.description) || command.extra.description


          const cmdEmbed: EmbedOptions = {
            title: `Yua For Dummies | ${uppercaseCat} | ${commandNameUppercase}`,
            color: colors.default,
            description: `Here is specific info on **${command.name}** I hope you find what you were looking for <3\n\nCommand Arguments:\n- \`[]\` is optional\n- \`<>\` is required\n- \`|\` means "OR"\n**\nDo not actually include [], <>, | symbols when using the command!**`,
            fields: [
              {
                name: "Usage",
                value: `\`\`\`${prefixes[0]} ${command.name}${command.extra.usage ? ` ${command.extra.usage}` : ""}\`\`\``,
                inline: false,
              },
              {
                name: "Description",
                value: `\`\`\`${description}\`\`\``,
                inline: false,
              },
              {
                name: "Aliases",
                value: `${command.extra.aliases[0] ? `\`${command.extra.aliases.join("`, `")}\`` : `No Aliases`}`,
                inline: true,
              },
              {
                name: "Category",
                value: `\`${command.extra.category}\``,
                inline: true,
              },
            ],
            // thumbnail: {
            //   url: this.yua.client.user.avatarURL,
            // },
            footer: {
              text: `Yua v${process.env.npm_package_version} | ${this.yua.commandHandler.commandsArray.length} Commands Loaded`,
            },
          }
          embed(cmdEmbed)

          return
        } else {
          quickEmbed(null, `I could not find the command, category, or alias **"${args[0]}"**`, colors.error)

          return
        }
      }
    }
  }
  private sort(a: BaseCommand, b: BaseCommand): number {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1

    return 0
  }
}

export = YuaCommand
