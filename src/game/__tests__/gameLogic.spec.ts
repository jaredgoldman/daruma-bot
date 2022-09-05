import { diceRolls, damageCalc } from '../gameLogic'
import Game from '../../models/game'

// describe('game test suite', () => {
//   const players = createPlayers(2)
//   const game = new Game(players, 2, '1005510628217192579')

//   it('Should produce a Winner without a tie', async () => {
//     runGame(game, true)
//     expect(game.maxRoundNumber).toBeGreaterThan(0)
//     expect(game.active).toBe(false)
//   })
//   it('Should produce a Winner with a tie', async () => {
//     // TODO: this logic
//     game.players[0]._rolls = [6, 6, 6, 6, 6, 6, 6]
//     game.players[1]._rolls = [6, 6, 6, 6, 6, 6, 6]
//     runGame(game, true)
//     expect(game.zen).toBeTruthy()
//     expect(game.active).toBe(false)

//   })

// })

describe('Test Dice Rolls', () => {
  const rolls = diceRolls(100)
  const belowSix = (diceSide: number) => diceSide <= 6

  it('Produces correct 6-sided dice numbers', () => {
    expect(rolls.every(belowSix)).toBeTruthy()
  })
})

describe('Check Dice Rolls to Damage Converter', () => {
  const rollsWin = damageCalc([1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5])
  const doArraysIntersect = (array1: Array<number>, array2: Array<number>) =>
    array1.some((item1) => array2.includes(item1))

  it('Produce Correct Damage Numbers', () => {
    expect(doArraysIntersect(rollsWin, [1, 2, 3])).toBeTruthy()
    expect(rollsWin).toEqual([1, 1, 2, 2, 3, 3, 1, 1, 2, 2, 3])
  })
})

describe('Test Damage Win Index', () => {
  const rollsWin = damageCalc([6, 6, 6, 6, 6, 6, 6])

  it('Tests damage array has the correct win index', () => {
    expect(rollsWin.length).toBe(7)
  })
})

describe('Test Damage Reset Win Index', () => {
  const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 6])

  it('Tests damage array has the correct win index if there is a bust', () => {
    expect(rollsWinReset.length).toBe(10)
  })
})

describe('Test Damage No Win', () => {
  const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 3])

  it('Tests if damage array correctly identifies a no-win', () => {
    expect(rollsWinReset.length).toBe(0)
  })
})
