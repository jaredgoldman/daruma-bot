import { collections } from '../database.service'
import { Withdrawal } from '../../models/withdrawal'

export const saveWithdrawal = async (withdrawal: Withdrawal) => {
  return await collections.tokenWithdrawals.insertOne(withdrawal)
}
