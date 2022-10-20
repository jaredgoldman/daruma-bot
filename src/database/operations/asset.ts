// Schema
import Asset from '../../models/asset'
// Database
import { collections } from '../database.service'

export const addAsset = async (asset: Asset) => {
  const dbAsset = await collections.assets.findOne({ id: asset.id })
  if (dbAsset) {
    return
  } else {
    return await collections.assets.insertOne(asset)
  }
}

export const findAsset = async (assetId: string) => {
  try {
    return await collections.assets.findOne({ assetId })
  } catch (error) {
    console.log('****** CANNOT FIND ASSET ******', error)
  }
}
