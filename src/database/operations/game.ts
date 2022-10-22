// Schema
import { WithId } from 'mongodb'
import Encounter from '../../models/encounter'
import { ChannelSettings } from '../../types/game'
// Utils
import { Logger } from '../../utils/logger'
import * as Logs from '../../utils/logs.json'
// Database
import { collections } from '../database.service'

export const getSettings = async (): Promise<
  WithId<ChannelSettings>[] | void
> => {
  const settings = (await collections.settings
    .find()
    .toArray()) as WithId<ChannelSettings>[]
  if (settings?.length!) {
    return Logger.warn(Logs.warn.noSettingsFound)
  }
  return settings
}

export const getChannelSettings = async (
  channelId: string
): Promise<WithId<ChannelSettings>> =>
  (await collections.settings.findOne({ channelId })) as WithId<ChannelSettings>

export const saveEncounter = async (encounter: Encounter): Promise<void> => {
  await collections.encounters.insertOne(encounter)
}
