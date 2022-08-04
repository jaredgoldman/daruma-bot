import { ObjectId } from 'mongodb'

export default class Encounter {
  constructor(
    public winnerId: ObjectId,
    public rounnds: number,
    public startTime: number,
    public endTime: number,
    public gameType: string
  ) {}
}
