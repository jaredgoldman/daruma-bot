// Discord
import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
// Helpers
import fs from 'node:fs'

// Globals
import { env } from '../utils/environment'
import { Logger } from '../utils/logger'

const commands = []

const commandFiles = fs.readdirSync('./src/commands')
for (const file of commandFiles) {
  const name = file.endsWith('.ts')
    ? file.replace('.ts', '')
    : file.replace('.js', '')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(`../commands/${name}`)
  if (command.enabled) {
    commands.push(command.data.toJSON())
  }
}
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN)
rest
  .put(
    Routes.applicationGuildCommands(
      env.DISCORD_CLIENT_ID,
      env.DISCORD_GUILD_ID
    ),
    {
      body: commands,
    }
  )
  .then(() => {
    Logger.info('Successfully registered application commands.')
    process.exit()
  })
  .catch(console.error)
