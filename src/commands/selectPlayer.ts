// Discord
import {
  MessageActionRowComponentBuilder,
  SlashCommandBuilder,
} from '@discordjs/builders'
import {
  ActionRowBuilder,
  ButtonInteraction,
  SelectMenuBuilder,
} from 'discord.js'

// Data
import { findUserByDiscordId } from '../database/operations/user'
// Schemas
// Globals
import Asset from '../models/asset'
import { games } from '../models/bot'
import { env } from '../utils/environment'
import { Logger } from '../utils/logger'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-player')
    .setDescription(`Pick which ${env.ALGO_UNIT_NAME} you'd like to compete`),
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

      const user = await findUserByDiscordId(id)

      if (user === null) {
        return await interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      const userAssetsArr = Object.values(user.assets)

      if (!userAssetsArr.length) {
        return await interaction.editReply({
          content: `You have no ${env.ALGO_UNIT_NAME} to select!`,
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
      let components: ActionRowBuilder<MessageActionRowComponentBuilder>[] = []
      components.push(
        new ActionRowBuilder({
          components: [
            new SelectMenuBuilder()
              .setCustomId('register-player')
              .setMinValues(1)
              .setPlaceholder(`Select a ${env.ALGO_UNIT_NAME} to attack`)
              .setOptions(options),
          ],
        })
      )

      await interaction.editReply({
        content: `Choose your ${env.ALGO_UNIT_NAME}`,
        components,
      })
    } catch (error) {
      Logger.error('****** ERROR SELECTING PLAYER******', error)
    }
  },
}
