import { ObjectId } from 'mongodb'

export default class Encounter {
  rounds: number
  startTime: number

  constructor(
    public winnerDiscordId: number,
    public gameType: string,
    public endTime: number
  ) {
    this.rounds = 0
    this.startTime = Date.now()
  }
}
