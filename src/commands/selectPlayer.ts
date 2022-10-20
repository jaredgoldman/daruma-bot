// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  ActionRowBuilder,
  ButtonInteraction,
  SelectMenuBuilder,
} from 'discord.js'
// Data
// Schemas
import { WithId } from 'mongodb'

// Globals
import { collections } from '../database/database.service'
import { games } from '../index'
import Asset from '../models/asset'
import User from '../models/user'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-player')
    .setDescription(`Pick which Daruma you'd like to compete`),
  /**
   * Sends a select menu to user to pick asset for registration
   * @param interaction {ButtonInteraction}
   * @returns {void}
   */
  async execute(interaction: ButtonInteraction) {
    try {
      const {
        channelId,
        user: { id },
      } = interaction

      const game = games[channelId]
      const settings = game.getSettings()

      if (!settings) {
        return await interaction.reply({
          content: `There are no settings for this game`,
          ephemeral: true,
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const user = (await collections.users.findOne({
        discordId: id,
      })) as WithId<User>

      if (user === null) {
        return await interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      const userAssetsArr = Object.values(user.assets)

      if (!userAssetsArr.length) {
        return await interaction.editReply({
          content: 'You have no Darumas to select!',
        })
      }

      const options = userAssetsArr
        .map((asset: Asset, i: number) => {
          if (i < settings.maxAssets) {
            const label = asset.alias || asset.name
            const normalizedLabel = label.slice(0, 20)
            return {
              label: normalizedLabel,
              description: 'Select to play',
              value: asset.id.toString(),
            }
          }
        })
        .filter(Boolean) as {
        label: string
        description: string
        value: string
      }[]

      const selectMenu = new SelectMenuBuilder()
        .setCustomId('register-player')
        .setPlaceholder('Select an Daruma to attack')

      if (options.length) {
        selectMenu.addOptions(options)
      }

      const row = new ActionRowBuilder().addComponents(selectMenu)

      await interaction.editReply({
        content: 'Choose your Daruma',
        //@ts-ignore
        components: [row],
      })
    } catch (error) {
      console.log('****** ERROR SELECTING ******', error)
    }
  },
}
