// Discord
import { SelectMenuInteraction } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
// Schemas
import Asset from '../models/asset'
import { WithId } from 'mongodb'
import User from '../models/user'
import Player from '../models/player'
// Helpers
import { checkIfRegisteredPlayer, downloadFile } from '../utils/helpers'
// Globals
import { games } from '..'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-player')
    .setDescription('Register an active player'),
  enabled: true,
  async execute(interaction: SelectMenuInteraction) {
    try {
      if (!interaction.isSelectMenu()) return
      const channelId = interaction.channelId
      const game = games[channelId]

      if (!game.getIsWaitingRoom()) return

      const { values, user } = interaction
      const assetId = values[0]
      const { username, id: discordId } = user
      const { maxCapacity } = game.getSettings()

      // Check if user is another game
      if (checkIfRegisteredPlayer(games, assetId, discordId)) {
        return interaction.reply({
          ephemeral: true,
          content: `You can't register with the same asset in two games at a time`,
        })
      }
      // Check for game capacity, allow already registered user to re-register
      // even if capacity is full
      if (game.getPlayerCount() < maxCapacity || game.getPlayer(discordId)) {
        await interaction.deferReply({ ephemeral: true })

        const { address, _id, coolDowns, assets } =
          (await collections.users.findOne({
            discordId: user.id,
          })) as WithId<User>

        const asset = assets[assetId]

        const coolDown = coolDowns ? coolDowns[assetId] : null

        if (coolDown && coolDown > Date.now()) {
          const minutesLeft = Math.floor((coolDown - Date.now()) / 60000)
          const minuteWord = minutesLeft === 1 ? 'minute' : 'minutes'
          return interaction.editReply({
            content: `Please wait ${minutesLeft} ${minuteWord} before playing ${asset.name} again`,
          })
        }

        let localPath

        try {
          localPath = await downloadFile(asset, username)
        } catch (error) {
          console.log('download error', error)
        }

        if (!localPath) {
          return
        }

        // check again for capacity once added
        if (
          game.getPlayerCount() >= maxCapacity &&
          !game.getPlayer(discordId)
        ) {
          return interaction.editReply(
            'Sorry, the game is at capacity, please wait until the next round'
          )
        }

        const newPlayer = new Player(username, discordId, address, asset, _id)
        game.addPlayer(newPlayer)
        await interaction.editReply(
          `${asset.alias || asset.name} has entered the game`
        )
        game.updateGame()
      } else {
        interaction.reply({
          content:
            'Sorry, the game is at capacity, please wait until the next round',
          ephemeral: true,
        })
      }
    } catch (error) {
      console.log(error)
    }
  },
}
