export class Withdrawal {
  constructor(
    public discordId: string,
    public amount: number,
    public walletAddress: string,
    public txId: string,
    public timestamp: string
  ) {}
}
