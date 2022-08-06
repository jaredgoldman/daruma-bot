// Discord
import {
  Client,
  Intents,
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
import { settings } from './settings'
// Schema
import Game from './models/game'
// Helpers
import { convergeTxnData } from './utils/algorand'

const token = process.env.DISCORD_TOKEN as string
const creatorAddresses = process.env.CREATOR_ADDRESSES as string
const channelId = process.env.CHANNEL_ID as string

// Gloval vars
// export let game: Game = new Game({}, false, false, coolDownInterval)
export let channel: TextChannel

export const creatorAddressArr = creatorAddresses.split(',')

export const client: Client = new Client({
  restRequestTimeout: 60000,
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
})

client.once('ready', async () => {
  try {
    await connectToDatabase()
    console.log('Ye Among AOWLs - Server ready')

    let update = true
    if (!fs.existsSync('dist/txnData/txnData.json')) {
      update = false
      fs.writeFileSync('dist/txnData/txnData.json', '')
    }

    const txnData = await convergeTxnData(creatorAddressArr, update)

    fs.writeFileSync('dist/txnData/txnData.json', JSON.stringify(txnData))

    channel = client.channels.cache.get(channelId) as TextChannel

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
    console.log('CLIENT ERROR', error)
  }
})

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
      // ensure two games can't start simultaneously
      // if (
      //   (game?.active || game?.waitingRoom) &&
      //   interaction.commandName === 'start'
      // ) {
      //   return await interaction.reply({
      //     content: 'A game is already running',
      //     ephemeral: true,
      //   })
      // }

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
