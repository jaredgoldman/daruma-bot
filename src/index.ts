// Discord
import {
  Client,
  Collection,
  GatewayIntentBits,
  Interaction,
  InteractionType,
  TextChannel,
} from 'discord.js'
// Node
import fs from 'node:fs'

// Helpers
import gatherEmojis from './core/emojis'
import { connectToDatabase } from './database/database.service'
// Schema
import { getSettings } from './database/operations/game'
import startWaitingRoom from './game/index'
import Game from './models/game'
// Helpers
import { ChannelSettings } from './types/game'
import { asyncForEach, checkEnv } from './utils/sharedUtils'

export const clientId = process.env.DISCORD_CLIENT_ID as string
export const guildId = process.env.DISCORD_GUILD_ID as string
export const token = process.env.DISCORD_TOKEN as string
export const games: { [key: string]: Game } = {}
export let emojis: { [key: number | string]: string } = {}

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

client.once('ready', async () => {
  try {
    // Ensure all env variables are set
    checkEnv()
    console.log('READY')
    // Connect to db instance
    await connectToDatabase()
    // Grab emojis from cache
    emojis = gatherEmojis(client)
    // Register discord commands
    setupCommands()
    // Start game for each channel
    startGame()
    console.log('Daruma Bot - Server ready')
  } catch (error) {
    console.log('****** ****** CLIENT ERROR ****** ******', error)
  }
})

const startGame = async (): Promise<void> => {
  try {
    const settings = await getSettings()
    // start game for each channel
    await asyncForEach(settings, async (settings: ChannelSettings) => {
      const channel = client.channels.cache.get(
        settings.channelId
      ) as TextChannel
      const newGame = new Game(settings)
      games[settings.channelId] = newGame
      startWaitingRoom(channel)
    })
  } catch (error) {
    console.log('****** ERROR STARTING GAMES ******', error)
  }
}

const setupCommands = (): void => {
  try {
    client.commands = new Collection()
    const commandFiles = fs.readdirSync('./src/commands')
    for (const file of commandFiles) {
      const name = file.endsWith('.ts')
        ? file.replace('.ts', '')
        : file.replace('.js', '')
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const command = require(`./commands/${name}`)
      client.commands.set(command.data.name, command)
    }
  } catch (error) {
    console.log('****** ERROR SETTING UP COMMANDS ******', error)
  }
}
/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on('interactionCreate', async (interaction: Interaction) => {
  try {
    let command
    if (interaction.type === InteractionType.ApplicationCommand) {
      command = client.commands.get(interaction.commandName)
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
      command = client.commands.get(interaction.customId)
    }
    if (!command) return
    await command.execute(interaction)
  } catch (error) {
    console.log('****** INTERACTION ERROR ******', error)
  }
})
client.login(token)
