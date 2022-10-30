// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'

// Data
import doEmbed from '../core/embeds'
import { findUserByDiscordId } from '../database/operations/user'
import { redisClient } from '../database/redis.service'
import { games } from '../models/bot'
// Helpers
import {
  AssetCoolDown,
  CooldownContent,
  CoolDownField,
  EmbedType,
} from '../types/embeds'
import { asyncForEach, formatTimeString } from '../utils/sharedUtils'
// Schema

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cd')
    .setDescription('See your asset cooldowns'),

  enabled: true,
  /**
   * Allows user to see list of assets on cooldown
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return
    const { user, channelId } = interaction
    const game = games[channelId]

    await interaction.deferReply({ ephemeral: true })

    const userData = await findUserByDiscordId(user.id)

    if (!userData) {
      return await interaction.editReply({
        content: 'You Are Not In The Database',
      })
    }

    const assetCooldowns = Object.entries(userData.coolDowns)

    if (!assetCooldowns.length) {
      return await interaction.editReply({
        content: `You have no cooldowns!`,
      })
    }

    // Format fields
    const fields: CoolDownField[] = []
    await asyncForEach(assetCooldowns, async (cooldown: AssetCoolDown) => {
      const [assetId, utcTimestamp] = cooldown
      const { name } = await redisClient.hgetall(assetId.toString())
      const formattedTimeString = formatTimeString(utcTimestamp)
      const cooldownData = {
        name,
        formattedTimeString,
        utcTimestamp,
        assetId,
      }
      fields.push(cooldownData)
    })

    const sortedContent = fields.sort((a, b) => {
      if (a.utcTimestamp > b.utcTimestamp) return 1
      if (a.utcTimestamp < b.utcTimestamp) return -1
      return 0
    })

    // Send initial embed
    const discordFieldLimit = 25
    const totalPages = Math.ceil(fields.length / discordFieldLimit)
    const firstPageFields = sortedContent.slice(0, discordFieldLimit)
    await interaction.editReply(
      doEmbed<CooldownContent>(EmbedType.cooldown, game, {
        fields: firstPageFields,
        page: 1,
        totalPages,
      })
    )

    // Paginate embeds if more than 25 fields
    if (totalPages > 1) {
      for (let i = 0; i < totalPages; i++) {
        const startIndex = i * discordFieldLimit
        const endIndex = startIndex + discordFieldLimit
        const pageFields = sortedContent.slice(startIndex, endIndex)
        await interaction.followUp(
          doEmbed<CooldownContent>(EmbedType.cooldown, game, {
            fields: pageFields,
            page: i + 1,
            totalPages,
          })
        )
      }
    }
  },
}
