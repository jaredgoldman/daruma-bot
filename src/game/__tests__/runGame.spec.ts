import runGame, { rollDice } from '../runGame'
import { players } from '../../mocks/game'
import Game from '../../models/game'

describe('game test suite', () => {
  const game = new Game(players, false, false, 2, '1005510628217192579', 1)

  runGame(game, true)

  it('should produce a winner with 21 as total score', async () => {
    expect(game.win).toBe(true)
    expect(
      game.winnerDiscordId && players[game.winnerDiscordId].totalScore === 21
    ).toBeTruthy()
    expect(game.active).toBe(false)
  })
})

describe('RNG test suite', () => {
  it('produces correct numbers', () => {
    for (let i = 1; i < 10; i++) {
      const { damage, numberRolled } = rollDice()
      expect(numberRolled <= 6).toBeTruthy()
      expect(damage === 1 || damage === 2 || damage === 3).toBeTruthy()
    }
  })
})
