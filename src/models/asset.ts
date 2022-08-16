export default class Asset {
  constructor(
    public assetId: number,
    public assetName: string,
    public assetUrl: string,
    public unitName: string,
    public localPath?: string,
    public alias?: string
  ) {}
}
