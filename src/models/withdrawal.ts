export class Withdrawal {
  constructor(
    public discordId: string,
    public amount: number,
    public address: string,
    public txId: string,
    public timestamp: string
  ) {}
}
