import { WithId } from 'mongodb'

// Schema
import Asset from '../../models/asset'
// Database
import { Logger } from '../../utils/logger'
import { collections } from '../database.service'

const _addAsset = async (asset: Asset): Promise<void> => {
  const dbAsset = await collections.assets.findOne({ id: asset.id })
  if (!dbAsset) {
    await collections.assets.insertOne(asset)
  }
}

const _findAsset = async (
  assetId: string
): Promise<WithId<Asset> | undefined> => {
  try {
    return (await collections.assets.findOne({ assetId })) as WithId<Asset>
  } catch (error) {
    Logger.error('****** CANNOT FIND ASSET ******', error)
  }
}
