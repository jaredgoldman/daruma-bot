// Discord
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
// Node
import fs from 'node:fs'
import path from 'node:path'

const clientId = process.env.DISCORD_CLIENT_ID as string
const guildId = process.env.DISCORD_GUILD_ID as string
const token = process.env.DISCORD_TOKEN as string

const commands = []
const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  const command = require(filePath)
  if (command.enabled) {
    commands.push(command.data.toJSON())
  }
}

const rest = new REST({ version: '9' }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error)
