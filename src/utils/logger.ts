import { Client, DiscordAPIError } from 'discord.js'
import pino from 'pino'

import { env } from './environment'

let logger = pino(
  {
    formatters: {
      level: label => {
        return { level: label }
      },
    },
  },
  pino.transport({
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    },
  })
)
logger.level = env.PINO_LOG_LEVEL
export class Logger {
  private static shardId: number

  public static info(message: string, obj?: any): void {
    obj ? logger.info(obj, message) : logger.info(message)
  }

  public static warn(message: string, obj?: any): void {
    obj ? logger.warn(obj, message) : logger.warn(message)
  }
  public static debug(message: string, obj?: any): void {
    obj ? logger.debug(obj, message) : logger.debug(message)
  }

  public static async error(message: string, obj?: any): Promise<void> {
    // Log just a message if no error object
    if (!obj) {
      logger.error(message)
      return
    }

    // Otherwise log details about the error
    if (typeof obj === 'string') {
      logger
        .child({
          message: obj,
        })
        .error(message)
    } else if (obj instanceof DiscordAPIError) {
      logger
        .child({
          message: obj.message,
          code: obj.code,
          statusCode: obj.status,
          method: obj.method,
          url: obj.url,
          stack: obj.stack,
        })
        .error(message)
    } else {
      logger.error(obj, message)
    }
  }

  public static setShardId(shardId: number): void {
    if (this.shardId !== shardId) {
      this.shardId = shardId
      logger = logger.child({ shardId })
    }
  }
}

export const initLog = async (client: Client): Promise<string> => {
  const currentDate = new Date()
  return `
====================================================
BOT IS NOW ONLINE
----------------------------------------------------
Boot time:                ${process.uptime()}s
Current Time:             ${currentDate.toLocaleString()}
Current Time (ISO):       ${currentDate.toISOString()}
Current Time (epoch, ms): ${currentDate.getTime()}
Current Client:           ${client.user?.tag} 
Current Client ID:        ${client.user?.id}
====================================================
`
}
