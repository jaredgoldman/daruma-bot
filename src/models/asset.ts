export default class Asset {
  public alias: string | undefined
  public localPath: string | undefined
  public wins: number
  public losses: number
  public kos: number
  constructor(
    public url: string,
    public id: number,
    public name: string,
    public unitName: string
  ) {
    this.alias = undefined
    this.localPath = undefined
    this.wins = 0
    this.losses = 0
    this.kos = 0
  }
}
