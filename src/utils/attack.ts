import Game from '../models/game'
import Player from '../models/player'
import { RollData } from '../types/attack'
import { randomNumber } from '../utils/helpers'

/**
 * Creates an array of random numbers between one and six with a length of 100
 * @returns array of numbers
 */
export const diceRolls = (arrayLength: number): Array<number> =>
  Array.from({ length: arrayLength }, () => randomNumber(1, 6))

/**
 * Takes an array of rolls between 1 and 6 and maps damage to said numbers
 * @param diceRolls number
 * @returns
 */
export const damageCalc = (diceRolls: Array<number>): Array<RollData> => {
  const diceValues: { [key: number]: number } = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
  }
  let totalScore = 0
  let damage = diceRolls.map((diceRandValue) => ({
    damage: diceValues[diceRandValue],
    roll: diceRandValue,
  }))
  let gameWinIndex = 0

  damage.map(({ damage: theDmg }, index) => {
    totalScore += theDmg
    if (totalScore === 21) {
      gameWinIndex = index
    }
    if (totalScore > 21 && gameWinIndex === 0) {
      totalScore = 15
    }
  })
  if (gameWinIndex > 0) {
    damage = damage.slice(0, gameWinIndex + 1)
  }
  if (gameWinIndex === 0) {
    damage = []
  }
  return damage
}

/**
 * Creates an array of rolls that add up to 21
 * @returns ArrayMnumbeR>
 */
export const completeGameForPlayer = (): Array<RollData> => {
  const rolls = diceRolls(100)
  return damageCalc(rolls)
}
