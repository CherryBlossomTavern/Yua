/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk from 'chalk'
import moment from 'moment'

/**
 * Send Success Log To Console
 */
export const success = (...content: any[]): void => {
  console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.green("[SUCCESS]")}`, ...content)
}
/**
 * Send Log To Console
 */
export const log = (...content: any[]): void => {
  console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.grey("[LOG]")}`, ...content)
}
/**
 * Send Info Log To Console
 */
export const info = (...content: any[]): void => {
  console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.cyan("[INFO]")}`, ...content)
}
/**
 * Send Warn Log To Console
 */
export const warn = (...content: any[]): void => {
  console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.yellow("[WARN]")}`, ...content)
}
/**
 * Send Error Log To Console
 */
export const error = (...content: any[]): void => {
  console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.red("[ERROR]")}`, ...content)
}
/**
 * Send Debug Log To Console
 */
export const debug = (...content: any[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk.magenta("[DEBUG]")}`, ...content)
  }
}

export const custom = (header: string, color: "black" | "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "white" | "gray", ...content: any[]): void => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${chalk.gray(moment().format("YYYY-MM-DD HH:mm:ss"))} ${chalk[color](`[${header}]`)}`, ...content)
  }
}
