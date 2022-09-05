import { AssetData } from '../../models/asset'
import { collections } from '../database.service'

export const addAsset = async (asset: AssetData) => {
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
    console.log("****** CAN'T FIND ASSET ******", error)
  }
}
