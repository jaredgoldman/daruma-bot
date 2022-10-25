/**
 * Basic schema for NFT a user owns
 */
export default class Asset {
  public alias: string | undefined
  public wins: number
  public losses: number
  constructor(
    public url: string,
    public id: number,
    public name: string,
    public unitName: string
  ) {
    this.alias = undefined
    this.wins = 0
    this.losses = 0
  }
}
