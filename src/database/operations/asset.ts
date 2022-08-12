import Asset from '../../models/asset'
import { collections } from '../database.service'

export const addAsset = async (asset: Asset) => {
  const dbAsset = await collections.assets.findOne({ assetId: asset.assetId })
  if (dbAsset) {
    return
  } else {
    return await collections.assets.insertOne(asset)
  }
}
