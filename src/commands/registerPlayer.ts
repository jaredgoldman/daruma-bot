// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { SelectMenuInteraction } from 'discord.js'
// Data
import { findUserByDiscordId } from '../database/operations/user.js'
// Schemas
import { games } from '../index'
import Asset from '../models/asset'
import { GameStatus } from '../constants/game.js'
import Player from '../models/player'
// Helpers
import { checkIfRegisteredPlayer } from '../utils/gameUtils'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register-player')
    .setDescription('Register an active player'),
  /**
   * Registers a player and adds a discord role if successful
   * @param interaction {SelectMenuInteraction}
   */
  async execute(interaction: SelectMenuInteraction) {
    try {
      if (!interaction.isSelectMenu()) return
      const channelId = interaction.channelId
      const game = games[channelId]

      if (game.getStatus() !== GameStatus.waitingRoom) return

      const { values, user } = interaction
      const assetId = values[0]
      const { username, id: discordId } = user
      const { maxCapacity } = game.getSettings()

      // Check if user is another game
      if (checkIfRegisteredPlayer(games, assetId, discordId)) {
        return await interaction.reply({
          ephemeral: true,
          content: `You can't register with the same asset in two games at a time`,
        })
      }
      // Check for game capacity, allow already registered user to re-register
      // even if capacity is full
      if (game.getPlayerCount() < maxCapacity || game.getPlayer(discordId)) {
        await interaction.deferReply({ ephemeral: true })

        const { address, _id, coolDowns, assets } = await findUserByDiscordId(
          user.id
        )

        const asset: Asset = assets[assetId]

        // Handle cooldown for asset
        const coolDown = coolDowns ? coolDowns[assetId] : null
        if (coolDown && coolDown > Date.now()) {
          const minutesLeft = Math.floor((coolDown - Date.now()) / 60000)
          let timeUnit = ''
          let timeUnitType = ''
          if (minutesLeft >= 60) {
            const hoursLeft = Math.floor(minutesLeft / 60)
            timeUnit = `${hoursLeft} hours`
            timeUnitType = hoursLeft > 1 ? 'hours' : 'hour'
          } else {
            timeUnit = `${minutesLeft} minutes`
            timeUnitType = minutesLeft > 1 ? 'minutes' : 'minute'
          }
          return await interaction.editReply({
            content: `Please wait ${timeUnit} ${timeUnitType} before playing ${asset.name} again`,
          })
        }

        // check again for capacity once added
        if (
          game.getPlayerCount() >= maxCapacity &&
          !game.getPlayer(discordId)
        ) {
          return await interaction.editReply(
            'Sorry, the game is at capacity, please wait until the next round'
          )
        }

        // Finally, add player to game
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
