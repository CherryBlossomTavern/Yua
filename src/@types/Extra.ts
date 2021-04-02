export interface YuaConsole {
  success(...content): void
  log(...content): void
  info(...content): void
  warn(...content): void
  error(...content): void
  debug(...content): void
  custom(header: string, color: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray", ...content): void
}
