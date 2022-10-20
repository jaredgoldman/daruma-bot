// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'
// Data
import { getChannelSettings } from '../database/operations/game'
import { findUserByDiscordId } from '../database/operations/user'
// Globals
import { games } from '../index'
// Helpers
import { GameStatus } from '../constants/game.js'
import { confirmRole } from '../utils/discordUtils'

const adminId = process.env.ADMIN_ROLE_ID || ''
module.exports = {
  data: new SlashCommandBuilder()
    .setName('start-game')
    .setDescription('start the game'),
  enabled: true,
  /**
   * Response to start game button
   * If user is admin or active player and enough players are registered
   * start the game
   * @param interaction {ButtonInteraction}
   * @returns {void}
   */
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return
    const {
      channelId,
      user: { id: discordId },
    } = interaction
    const game = games[channelId]
    const { minCapacity } = await getChannelSettings(channelId)

    // if game is in waiting room
    if (game.getStatus() !== GameStatus.waitingRoom) return

    await interaction.deferReply({ ephemeral: true })
    // if user is either registered OR admin
    const user = await findUserByDiscordId(discordId)
    const isUserAdmin = confirmRole(adminId, interaction, discordId)
    if (!game.getPlayer(user.discordId) && !isUserAdmin) {
      interaction.editReply({
        content: 'You cannot start the game if you are not registered',
      })
    }

    // if we are above min capacity of players
    if (game.getPlayerCount() < minCapacity) {
      return await interaction.editReply({
        content: `You cannot start the game with less than ${minCapacity} players`,
      })
    }

    // start game
    game.setStatus(GameStatus.activeGame)
    interaction.editReply('Game started')
  },
}
