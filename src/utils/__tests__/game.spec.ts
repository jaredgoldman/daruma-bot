import Player from '../../models/player'
import { getWinIndexes } from '../gameUtils'

describe('getWinIndexes', () => {
  it('should return the correct win index', () => {
    const players = [
      {
        getRoundsData: () => ({
          gameWinRollIndex: 1,
          gameWinRoundIndex: 1,
        }),
      },
      {
        getRoundsData: () => ({
          gameWinRollIndex: 0,
          gameWinRoundIndex: 1,
        }),
      },
      {
        getRoundsData: () => ({
          gameWinRollIndex: 2,
          gameWinRoundIndex: 0,
        }),
      },
    ] as Player[]
    const winIndexes = getWinIndexes(players)
    expect(winIndexes).toEqual({ roll: 1, round: 1 })
  })
})
