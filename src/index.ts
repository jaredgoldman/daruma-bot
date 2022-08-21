// Discord
import {
  Client,
  GatewayIntentBits,
  Interaction,
  Collection,
  SelectMenuInteraction,
  ButtonInteraction,
  TextChannel,
} from 'discord.js'
// Node
import fs from 'node:fs'
import path from 'node:path'
// Helpers
import { connectToDatabase } from './database/database.service'
// Globals
import settings from './settings'
// Schema
import Game from './models/game'
// Helpers
import { convergeTxnData } from './utils/algorand'
import { asyncForEach } from './utils/shared'
import startWaitingRoom from './game'

const token = process.env.DISCORD_TOKEN as string
const creatorAddresses = process.env.CREATOR_ADDRESSES as string
const channelIds = process.env.CHANNEL_IDS as string

// Gloval vars
export const games: { [key: string]: Game } = {}

export const creatorAddressArr = creatorAddresses?.split(',')
const channelIdArr = channelIds?.split(',')

export const client: Client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
})

client.once('ready', async () => {
  try {
    await connectToDatabase()
    console.log('Daruma Bot - Server ready')
    let update = true
    if (!fs.existsSync('dist/txnData/txnData.json')) {
      update = false
      fs.writeFileSync('dist/txnData/txnData.json', '')
    }

    const txnData = await convergeTxnData(creatorAddressArr, update)

    fs.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData))

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
    main()
  } catch (error) {
    console.log('CLIENT ERROR', error)
  }
})

const main = () => {
  // start game for each channel
  asyncForEach(channelIdArr, async (channelId: string) => {
    const channel = client.channels.cache.get(channelId) as TextChannel
    const { maxCapacity } = settings[channelId]
    games[channelId] = new Game({}, false, false, maxCapacity, channelId)
    startWaitingRoom(channel)
  })
}

/*
 *****************
 * COMMAND SERVER *
 *****************
 */

client.on(
  'interactionCreate',
  async (
    interaction: Interaction | SelectMenuInteraction | ButtonInteraction
  ) => {
    let command
    if (interaction.isCommand()) {
      command = client.commands.get(interaction.commandName)
    }
    if (interaction.isSelectMenu() || interaction.isButton()) {
      command = client.commands.get(interaction.customId)
    }
    if (!command) return

    try {
      await command.execute(interaction)
    } catch (error) {
      console.error(error)
    }
  }
)

client.login(token)
