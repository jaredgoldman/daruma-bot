import { collections } from '../database/database.service'
import { WithId } from 'mongodb'

export default class Asset {
  /*
   * Aliasing
   */
  private alias: string | undefined
  setAlias(alias: string) {
    this.alias = alias
  }

  getAlias() {
    return this.alias
  }

  /*
   * Local path
   */
  private localPath: string | undefined
  setLocalPath(localPath: string) {
    this.localPath = localPath
  }

  getLocalPath() {
    return this.localPath
  }

  /*
   * id
   */
  getId() {
    return this.id
  }
  setId(id: number) {
    this.id = id
  }

  /*
   * Name
   */
  getName() {
    return this.name
  }
  setName(name: string) {
    this.name = name
  }

  /*
   * URL
   */
  getUrl() {
    return this.url
  }
  setUrl(url: string) {
    this.url = url
  }

  /*
   * Unit name
   */
  getUnitName() {
    return this.unitName
  }
  setUnitName(unitName: string) {
    this.unitName = unitName
  }

  constructor(
    private id: number,
    private name: string,
    private url: string,
    private unitName: string
  ) {
    this.alias = undefined
    this.localPath = undefined
  }

  /*
   * Operations
   */

  async saveAsset() {
    try {
      const asset = (await collections.assets.findOne({
        id: this.id,
      })) as WithId<AssetData>
      if (!asset)
        await collections.assets.insertOne({
          id: this.id,
          name: this.name,
          url: this.url,
          unitName: this.unitName,
        })
    } catch (error) {
      console.log('****** ERROR SAVING ASSET ******', error)
    }
  }
}

export interface AssetData {
  id: number
  name: string
  url: string
  unitName: string
}
