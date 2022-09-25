import { Interaction } from 'discord.js'
// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { renderBoard } from '../game/board'
import mockPlayers from '../mocks/player'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('render-board')
    .setDescription('render a test board'),
  enabled: true,
  /**
   * Response to start game button
   * If user is admin or active player and enough players are registered
   * start the game
   * @param interaction {ButttonInteraction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return
    const board = renderBoard(1, 1, 2, mockPlayers)
    console.log(board)
    interaction.reply(board)
  },
}
