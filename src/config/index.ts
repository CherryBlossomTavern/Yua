export const prefixes = [
  "yua",
  "y!",
  "<YUA_BOT_MENTION>",
]

export let prefixesRegexpString = ""
for (const prefix of prefixes) {
  prefixesRegexpString += `|^${prefix}(\\s+|)`
}
prefixesRegexpString = `(${prefixesRegexpString.slice(1)})`

export const prefixRegEXP = new RegExp(prefixesRegexpString)

export const colors = {
  default:0xffedad, // #ffedad
  error:0xffadad, // #ffadad
  success:0xb0fdad, // #b0fdad
  info:0xb0d3ff, // #b0d3ff
}

export const categoryHelp: { [category: string]: { text: string, emoji: string } } = {
  roleplay: {
    text: "Many commands to fit any of your chat roleplay desires",
    emoji: ":hugging:",
  },
  utility: {
    text: "Left over commands that did not fit anywhere that may prove useful",
    emoji: ":flashlight:",
  },
}

export const defaultDevs: string[] = [
  "232597078650519553",
  "316669053957832706",
]
