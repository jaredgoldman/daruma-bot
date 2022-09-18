import { collections } from '../database.service'
import { WithId } from 'mongodb'
import { ChannelSettings, Settings } from '../../types/game'

export const getSettings = async (): Promise<WithId<ChannelSettings>[]> =>
  (await collections.settings.find().toArray()) as WithId<ChannelSettings>[]

export const getChannelSettings = async (
  channelId: string
): Promise<WithId<ChannelSettings>> =>
  (await collections.settings.findOne({ channelId })) as WithId<ChannelSettings>
