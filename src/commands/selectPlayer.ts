// Discord
import {
  ActionRowBuilder,
  ButtonInteraction,
  SelectMenuBuilder,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
import User from '../models/user'
// Schemas
import { WithId } from 'mongodb'
// Globals
import { games } from '..'
import Asset from '../models/asset'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-player')
    .setDescription(`Pick which Daruma you'd like to compete`),
  enabled: true,
  async execute(interaction: ButtonInteraction) {
    try {
      const {
        channelId,
        user: { id },
      } = interaction

      const game = games[channelId]
      const { maxAssets } = game.getSettings()

      if (!game.getIsWaitingRoom()) {
        return interaction.reply({
          content:
            'Game is not currently active. Use the /start command to start the game',
          ephemeral: true,
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const user = (await collections.users.findOne({
        discordId: id,
      })) as WithId<User>

      if (user === null) {
        return interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      if (!user.assets.length) {
        return interaction.editReply({
          content: 'You have no Darumas to select!',
        })
      }

      const options = Object.values(user.assets)
        .map((asset: Asset, i: number) => {
          if (i < maxAssets) {
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
      console.log('****** ERROR SELECTING ******')
      console.log(error)
    }
  },
}
