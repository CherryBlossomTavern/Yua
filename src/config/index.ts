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

export const categoryHelp: { [category: string]: { text: string, emoji: string, name: string } } = {
  roleplay: {
    name: "Roleplay",
    text: "Many commands to fit any of your chat roleplay desires",
    emoji: ":hugging:",
  },
  utility: {
    name: "Utility",
    text: "Left over commands that did not fit anywhere that may prove useful",
    emoji: ":flashlight:",
  },
  "reaction-roles": {
    name: "Reaction-Roles",
    text: "Let users react on a menu and recieve roles with ease",
    emoji: ":point_up_2:",
  },
  automation: {
    name: "Automation",
    text: "Automate things in your server to make life 10 times easier",
    emoji: ":robot:",
  },
}

export const defaultDevs: string[] = [
  "232597078650519553",
  "316669053957832706",
]

export const inviteRedirect = "https%3A%2F%2Fdiscord.gg%2Fyua"

export const boostMessageTypes: number[] = [
  8,
  9,
  10,
  11,
]

export const enum BoostMessageReplaceKeys {
  User = "{USER}",
  DisplayName = "{DISPLAYNAME}",
  Avatar = "{AVATAR}",
  ServerIcon = "{SERVERICON}",
  ServerBanner = "{SERVERBANNER}",
  Boosts = "{BOOST}",
  BoostsNeeded = "{BOOSTNEEDED}",
  Boost4Tier = "{BOOST4TIER}",
  Tier = "{TIER}",
  NextTier = "{NEXTTIER}",
  TierSuffix = "{TIERSUFFIX}",
  NextTierSuffix = "{NEXTTIERSUFFIX}"
}

export const BoostNeeded = {
  0: 2,
  1: 15,
  2: 30,
  3: 0,
}

export const NextTier = {
  0: 1,
  1: 2,
  2: 3,
  3: "Max",
}

export const TierSuffix = {
  0: "",
  1: "st",
  2: "nd",
  3: "rd",
  "Max": "",
}
