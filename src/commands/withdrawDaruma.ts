import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonInteraction } from 'discord.js'

// Discord
import { games } from '../index'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw-player')
    .setDescription('withdraw your daruma from the '),
  /**
   * Command to reemove a registered player from the game
   * @param interaction {ButttonInteraction}
   * @returns {void}
   */
  async execute(interaction: ButtonInteraction) {
    if (!interaction.isButton()) return
    const {
      channelId,
      user: { id: discordId },
    } = interaction
    const game = games[channelId]
    if (game.getPlayer(discordId)) {
      game.removePlayer(discordId)
      game.updateGame()
      interaction.reply({ content: 'Daruma withdrawn', ephemeral: true })
    } else {
      interaction.reply({ content: 'You are not registered', ephemeral: true })
    }
  },
}
