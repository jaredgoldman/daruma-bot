// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'

// Globals
import { games } from '../bot'
import { env } from '../utils/environment'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw-player')
    .setDescription(`Withdraw your ${env.ALGO_UNIT_NAME} from the game.`),
  /**
   * Command to remove a registered player from the game
   * @param interaction {ButtonInteraction}
   * @returns {void}
   */
  async execute(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.isButton()) return
    const {
      channelId,
      user: { id: discordId },
    } = interaction
    const game = games[channelId]
    if (game.getPlayer(discordId)) {
      game.removePlayer(discordId)
      game.updateGame()
      await interaction.reply({
        content: `${env.ALGO_UNIT_NAME} withdrawn`,
        ephemeral: true,
      })
    } else {
      await interaction.reply({
        content: `You do not have a ${env.ALGO_UNIT_NAME} currently entered!`,
        ephemeral: true,
      })
    }
  },
}
