// Discrod
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
import { WithId } from 'mongodb'
import { collections } from '../database/database.service'
import { findUserByDiscordId } from '../database/operations/user'
import User from '../models/user'
// Schemas
// Data
// Helpers

module.exports = {
  data: new SlashCommandBuilder()
    .setName('store')
    .setDescription('purchase prizes'),
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

    // grab enhancers settings
    const enhancers = collections.enhancers

    console.log(enhancers)

    // const options = enhancers
    //     .map((asset: Asset, i: number) => {
    //       if (i < maxAssets) {
    //         const label = asset.alias || asset.name
    //         const normalizedLabel = label.slice(0, 20)
    //         return {
    //           label: normalizedLabel,
    //           description: 'Select to play',
    //           value: asset.id.toString(),
    //         }
    //       }
    //     })
    //     .filter(Boolean) as {
    //     label: string
    //     description: string
    //     value: string
    // }[]
  },
}
