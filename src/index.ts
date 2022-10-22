// Discord
import { Client, GatewayIntentBits } from 'discord.js'

import { Bot } from './models/bot'
// Helpers
import { env } from './utils/environment'
import { Logger } from './utils/logger'
import * as Logs from './utils/logs.json'

async function start(): Promise<void> {
  const client: Client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.DirectMessages,
    ],
  })
  let bot = new Bot(env.DISCORD_TOKEN, client)
  bot.start()
}
process.on('unhandledRejection', (reason, _promise) => {
  Logger.error(Logs.error.unhandledRejection, reason)
})

start().catch(error => {
  Logger.error(Logs.error.unspecified, error)
})
export { start }
