export default class Asset {
  constructor(
    public assetId: number,
    public assetName: string,
    public assetUrl: string,
    public unitName: string
  ) {
    this.alias = undefined
    this.localPath = undefined
  }

  private alias: string | undefined
  setAlias(alias: string) {
    this.alias = alias
  }

  getAlias() {
    return this.alias
  }

  private localPath: string | undefined
  setLocalPath(localPath: string) {
    this.localPath = localPath
  }

  getLocalPath() {
    return this.localPath
  }
}
