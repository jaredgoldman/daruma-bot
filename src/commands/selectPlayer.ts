// Discord
import {
  ActionRowBuilder,
  ButtonInteraction,
  MessageActionRowComponent,
  SelectMenuBuilder,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
// Data
import { collections } from '../database/database.service'
// Schemas
import User from '../models/user'
import { WithId } from 'mongodb'
import { UserAsset } from '../models/user'
// Globals
import { games } from '..'
import settings from '../settings'

module.exports = {
  data: new SlashCommandBuilder()
    .setName('select-attacker')
    .setDescription(`Pick which Daruma you'd like to compete`),
  async execute(interaction: ButtonInteraction) {
    try {
      const {
        channelId,
        user: { id },
      } = interaction

      const game = games[channelId]

      const { maxAssets } = settings[channelId]

      if (!game.waitingRoom) {
        return interaction.reply({
          content:
            'Game is not currently active. Use the /start command to start the game',
          ephemeral: true,
        })
      }

      await interaction.deferReply({ ephemeral: true })

      const data = (await collections.users.findOne({
        discordId: id,
      })) as WithId<User>

      if (data === null) {
        return interaction.editReply({
          content: 'You are not registered. Use the /register command',
        })
      }

      const assetData = data?.assets ? Object.values(data.assets) : []

      if (!assetData.length) {
        return interaction.editReply({
          content: 'You have no Darumas to select!',
        })
      }

      const options = Object.values(data.assets)
        .map((asset: UserAsset, i: number) => {
          if (i < maxAssets) {
            const label = asset.alias || asset.assetName
            const normalizedLabel = label.slice(0, 20)
            return {
              label: normalizedLabel,
              description: 'Select to play',
              value: asset?.assetId?.toString(),
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
      console.log('ERROR SELECTING')
      console.log(error)
      //@ts-ignore
    }
  },
}
