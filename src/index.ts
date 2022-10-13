// Discord
import {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
  Interaction,
  InteractionType,
} from 'discord.js'
// Node
import fs from 'node:fs'
import path from 'node:path'
// Helpers
import { connectToDatabase } from './database/database.service'
// Schema
import Game from './models/game'
// Helpers
import { convergeTxnData } from './utils/algorandUtils'
import { asyncForEach } from './utils/sharedUtils'
import startWaitingRoom from './game'
import { getSettings } from './database/operations/game'
import { ChannelSettings, GameTypes } from './types/game'
import gatherEmojis from './core/emojis'

const token = process.env.DISCORD_TOKEN as string
const creatorAddresses = process.env.CREATOR_ADDRESSES as string
export const games: { [key: string]: Game } = {}
export let emojis: { [key: number | string]: string } = {}
export const creatorAddressArr = creatorAddresses?.split(',')

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
    await connectToDatabase()
    await txnDataSetup()
    emojis = gatherEmojis(client)
    setupCommands()
    startGame()
    console.log('Daruma Bot - Server ready')
  } catch (error) {
    console.log('****** ****** CLIENT ERROR ****** ******', error)
  }
})

const startGame = async () => {
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

const txnDataSetup = async () => {
  try {
    let update = true
    if (!fs.existsSync('dist/txnData/txnData.json')) {
      update = false
      fs.writeFileSync('dist/txnData/txnData.json', '')
    }
    const txnData = await convergeTxnData(creatorAddressArr, update)
    fs.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData))
  } catch (error) {
    console.log('****** ERROR SETTING UP TXN DATA ******', error)
  }
}

const setupCommands = () => {
  try {
    client.commands = new Collection()

    const commandsPath = path.join(__dirname, 'commands')
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith('.js'))

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file)
      const command = require(filePath)
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
