// Discrod
import { SlashCommandBuilder } from '@discordjs/builders'
import { Interaction, InteractionType } from 'discord.js'
// Schemas
import { WithId } from 'mongodb'
import User from '../models/user'
// Data
import { claimToken } from '../utils/algorandUtils'
import { collections } from '../database/database.service'
import { updateUserKarma } from '../database/operations/user'
import { saveWithdrawal } from '../database/operations/token'
import { Withdrawal } from '../models/withdrawal'
// Helpers

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('claim your hoot!'),

  enabled: true,
  /**
   * Allows user to initiate transfer oftoken to own wallet
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
        return interaction.editReply({
          content: 'You are not in the database',
        })
      }

      const { karma, address } = userData

      if (!karma) {
        return interaction.editReply({
          content: 'You have no hoot to claim',
        })
      }

      await updateUserKarma(user.id, 0)

      const txnData = await claimToken(karma, address)
      if (txnData) {
        saveWithdrawal(
          new Withdrawal(user.id, karma, address, txnData.txId, Date.now())
        )
        return interaction.editReply(
          `Congrats, you've just received ${karma} Karma!`
        )
      }
    } catch (error) {
      return interaction.editReply(
        'Something went wrong with your claim :( - please try again'
      )
    }
  },
}
