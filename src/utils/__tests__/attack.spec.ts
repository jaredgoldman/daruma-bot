import { PlayerRoundsData } from '../../types/attack'
import { diceRolls, damageCalc, rollDice } from '../attackUtils'
// import util from 'util'

describe('RNG test suite', () => {
  it('produces correct numbers', () => {
    for (let i = 1; i < 10; i++) {
      const { diceValue, number } = rollDice()
      expect(diceValue <= 6).toBeTruthy()
      expect(number === 1 || number === 2 || number === 3).toBeTruthy()
    }
  })
})

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

  it('saves the correct round and roll index', () => {
    const lastRoundIndex = playerRoundsData.rounds.length - 1
    const lastRollIndex = playerRoundsData.rounds[lastRoundIndex].rolls.length - 1
    expect(playerRoundsData.gameWinRoundIndex).toEqual(lastRoundIndex)
    expect(playerRoundsData.gameWinRollIndex).toEqual(lastRollIndex)
  })
})

describe('Test Damage Win Index', () => {
  const rollsWin = damageCalc([6, 6, 6, 6, 6, 6, 6])

  it('Tests damage array has the correct win index', () => {
    expect(rollsWin.gameWinRollIndex).toBe(0)
    expect(rollsWin.gameWinRoundIndex).toBe(2)
  })
})

describe('Test Damage Reset Win Index', () => {
  const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 6])

  it('Tests damage array has the correct win index if there is a bust', () => {
    expect(rollsWinReset.gameWinRollIndex).toBe(0)
    expect(rollsWinReset.gameWinRoundIndex).toBe(3)
  })
})

describe('Test Damage No Win', () => {
  const rollsWinReset = damageCalc([6, 6, 6, 6, 6, 6, 4, 3, 6, 3])

  it('Tests if damage array correctly identifies a no-win', () => {
    expect(rollsWinReset.gameWinRollIndex).toBe(0)
    expect(rollsWinReset.gameWinRoundIndex).toBe(0)
  })
})
