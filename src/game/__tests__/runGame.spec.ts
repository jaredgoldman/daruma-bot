import runGame from '../runGame'
import { players } from '../../mocks/game'
import Game from '../../models/game'

describe('game test suite', () => {
  const game = new Game(players, false, false, 2, '1005510628217192579')

  runGame(game, true)

  it('game should produce a winner with 21 as total score', async () => {
    expect(game.win).toBe(true)
    expect(
      game.winnerDiscordId && players[game.winnerDiscordId].totalScore === 21
    ).toBeTruthy()
    expect(game.active).toBe(false)
  })
})
