// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'

// Helpers
import { findUserByDiscordId } from '../database/operations/user'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('show user profile!'),
  enabled: false,
  /**
   * Allows user to initiate transfer of token to own wallet
   * WIP - much more detail can be added here
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return
    const {
      user: { id },
    } = interaction

    await interaction.deferReply({ ephemeral: true })

    const user = await findUserByDiscordId(id)

    if (user) {
      const { karma, walletAddress } = user
      interaction.editReply({ content: `${karma}\n${walletAddress}` })
    }
  },
}
