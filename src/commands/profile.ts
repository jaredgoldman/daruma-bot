// Discrod
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'

import { findUserByDiscordId } from '../database/operations/user'

// Schemas
// Data
// Helpers

module.exports = {
  data: new SlashCommandBuilder().setName('profile').setDescription('show user profile!'),
  enabled: true,
  /**
   * Allows user to initiate transfer oftoken to own wallet
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
      const { karma, address } = user
      interaction.editReply({ content: `${karma}\n${address}` })
    }
  },
}
