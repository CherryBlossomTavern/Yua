export const prefixes = [
  "yua",
  "y!",
  "{{MENTION}}",
]

export let prefixesRegexpString = ""
for (const prefix of prefixes) {
  prefixesRegexpString += `|^${prefix}(\\s+|)`
}
prefixesRegexpString = `(${prefixesRegexpString.slice(1)})`

export const colors = {
  default: "#ffedad",
  error: "#ffadad",
  success: "#b0fdad",
  info: "#b0d3ff",
}

export const commands = new Map()
export const commandsArray = []

export const responsePatterns = {
  
}
