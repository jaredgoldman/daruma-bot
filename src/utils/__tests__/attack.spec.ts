import { PlayerRoundsData } from '../../types/attack'
import { diceRolls, damageCalc } from '../attackUtils'
import util from 'util'
describe('Test Dice Rolls', () => {
  const rolls = diceRolls(100)
  const belowSix = (diceSide: number) => diceSide <= 6

  it('Produces correct 6-sided dice numbers', () => {
    expect(rolls.every(belowSix)).toBeTruthy()
  })
})

describe('Damage Calc Logic ', () => {
  const rolls = diceRolls(100)
  const playerRoundsData: PlayerRoundsData = damageCalc(rolls)
  util.inspect(playerRoundsData, {
    showHidden: false,
    depth: null,
    colors: true,
  })

  expect(playerRoundsData.gameWinRoundIndex).toBeGreaterThan(0)
})

// describe('Test Damage Win Index', () => {
//   const rollsWin = damageCalc([6, 6, 6, 6, 6, 6, 6])

//   it('Tests damage array has the correct win index', () => {
//     expect(rollsWin.length).toBe(7)
//   })
// })

// describe('Test Damage Reset Win Index', () => {
//   const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 6])

//   it('Tests damage array has the correct win index if there is a bust', () => {
//     expect(rollsWinReset.length).toBe(10)
//   })
// })

// describe('Test Damage No Win', () => {
//   const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 3])

//   it('Tests if damage array correctly identifies a no-win', () => {
//     expect(rollsWinReset.length).toBe(0)
//   })
// })
