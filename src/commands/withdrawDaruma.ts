import { ButtonInteraction } from 'discord.js'
// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { games } from '..'
// import { findUserByDiscordId } from '../database/operations/user'
// import { getChannelSettings } from '../database/operations/game'
// import { confirmRole } from '../utils/discordUtils'
// import { GameStatus } from '../models/game'

// const adminId = process.env.ADMIN_ROLE_ID as string
module.exports = {
  data: new SlashCommandBuilder()
    .setName('withdraw-player')
    .setDescription('withdraw your daruma from the '),
  /**
   * Response to start game button
   * If user is admin or active player and enough players are registered
   * start the game
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
    // const { minCapacity } = await getChannelSettings(channelId)
    if (game.getPlayer(discordId)) {
      game.removePlayer(discordId)
      game.updateGame()
      interaction.reply({ content: 'Daruma withdrawn', ephemeral: true })
    } else {
      interaction.reply({ content: "You're not registered", ephemeral: true })
    }
  },
}
