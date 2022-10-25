// Discord
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
// Schemas
import { WithId } from 'mongodb'

// Data
import { collections } from '../database/database.service'
import { saveWithdrawal } from '../database/operations/token'
import { updateUserKarma } from '../database/operations/user'
import User from '../models/user'
import { Withdrawal } from '../models/withdrawal'
import { claimToken } from '../utils/algorandUtils'
// Helpers

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('claim your Karma'),

  enabled: true,
  /**
   * Allows user to initiate transfer of token to own wallet
   * @param interaction {Interaction}
   * @returns {void}
   */
  async execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return
    try {
      const { user } = interaction

      await interaction.deferReply({ ephemeral: true })

      const userData = (await collections.users.findOne({
        discordId: user.id,
      })) as WithId<User>

      if (!userData) {
        return await interaction.editReply({
          content: 'You are not in the database',
        })
      }

      const { karma, walletAddress } = userData

      if (!karma) {
        return await interaction.editReply({
          content: 'You have no hoot to claim',
        })
      }

      await updateUserKarma(user.id, 0)

      const txnData = await claimToken(karma, walletAddress)
      if (txnData) {
        saveWithdrawal(
          new Withdrawal(
            user.id,
            karma,
            walletAddress,
            txnData.txId,
            new Date(Date.now()).toTimeString()
          )
        )
        return await interaction.editReply(
          `Congrats, you've just received ${karma} Karma!`
        )
      }
    } catch (error) {
      return await interaction.editReply(
        'Something went wrong with your claim :( - please try again'
      )
    }
  },
}
