import runGame from '../runGame'
import { players } from '../../mocks/game'
import Game from '../../models/game'

describe('game test suite', () => {
  //@ts-ignore
  const game = new Game(players, false, false, 2, '1005510628217192579')

  it('game should produce a winner with 21 as total score', async () => {
    await runGame(game, true)
    expect(game.win).toBe(true)
    expect(
      game.winnerDiscordId && players[game.winnerDiscordId].totalScore === 21
    ).toBeTruthy()
  })

  it('game should not be active after return', async () => {
    await runGame(game, true)
    expect(game.active).toBe(false)
  })
})
