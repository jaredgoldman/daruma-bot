import { ObjectId } from 'mongodb'

export default class Encounter {
  rounds: number
  startTime: number

  constructor(
    public winnerId: ObjectId,
    public endTime: number,
    public gameType: string
  ) {
    this.rounds = 0
    this.startTime = Date.now()
  }
}
