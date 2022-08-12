import { ObjectId, WithId } from 'mongodb'
import { collections } from '../database.service'
import User, { UserUpdateObject } from '../../models/user'
import Asset from '../../models/asset'

export const findUserById = async (_id: ObjectId) =>
  (await collections.users?.findOne({
    _id,
  })) as WithId<User>

export const findUserByDiscordId = async (discordId: string) =>
  (await collections.users?.findOne({
    discordId,
  })) as WithId<User>

export const updateUser = async (
  updateData: UserUpdateObject,
  _id?: ObjectId | string,
  discordId?: string
) => {
  if (!_id && !discordId) {
    throw new Error(
      'you need to provide a discordId or userId to update a user'
    )
  }
  const idObject = _id ? { _id } : { discordId }
  return await collections.users.findOneAndUpdate(idObject, {
    $set: { ...updateData },
  })
}
