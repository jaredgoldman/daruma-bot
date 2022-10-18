// Discord
import { REST } from '@discordjs/rest'
import { Routes } from 'discord.js'
// Node
import fs from 'node:fs'

import { clientId, guildId, token } from '../index'

const commands = []

const commandFiles = fs.readdirSync('./src/commands')
for (const file of commandFiles) {
  const name = file.endsWith('.ts') ? file.replace('.ts', '') : file.replace('.js', '')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const command = require(`../commands/${name}`)
  if (command.enabled) {
    commands.push(command.data.toJSON())
  }
}
const rest = new REST({ version: '9' }).setToken(token)

rest
  .put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => {
    console.log('Successfully registered application commands.')
    process.exit()
  })
  .catch(console.error)
