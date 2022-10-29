// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
import doEmbed from '../core/embeds'
// Data
import { findUserByDiscordId } from '../database/operations/user'
import { redisClient } from '../database/redis.service'
import { CooldownContent, EmbedType } from '../types/embeds'
import { games } from '../models/bot'
import { asyncForEach, formatTimeString } from '../utils/sharedUtils'
import { Logger } from 'mongodb'
// Helpers

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

    const cooldownContent: CooldownContent = []
    await asyncForEach(assetCooldowns, async (cooldown: [number, number]) => {
      const [assetId, cooldownTime] = cooldown
      const { name } = await redisClient.hgetall(assetId.toString())
      const timeString = formatTimeString(cooldownTime)
      cooldownContent.push({ name, timeString })
    })

    await interaction.editReply(
      doEmbed(EmbedType.cooldown, game, cooldownContent)
    )
  },
}
