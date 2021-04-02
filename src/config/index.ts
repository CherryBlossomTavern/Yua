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
  default:0xffedad, // #ffedad
  error:0xffadad, // #ffadad
  success:0xb0fdad, // #b0fdad
  info:0xb0d3ff, // #b0d3ff
}

export const responsePatterns = {
  
}
