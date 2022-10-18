import { PlayerRoundsData, RollData } from '../types/attack'
import { randomNumber } from './sharedUtils'
// import util from 'util'

const diceValues: { [key: number]: number } = {
  1: 1,
  2: 1,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
}

/**
 * Returns a random number between 1 and 6
 * @returns {number}
 */
export const rollDice = (): { number: number; diceValue: number } => {
  const ref = Math.floor(Math.random() * 6) + 1
  return {
    number: diceValues[ref],
    diceValue: ref,
  }
}

/**
 * Creates an array of random numbers between one and six with a length of 100
 * @returns array of numbers
 */
export const diceRolls = (arrayLength: number): Array<number> =>
  Array.from({ length: arrayLength }, () => randomNumber(1, 6))

/**
 * Takes an array of rolls between 1 and 6 and maps damage to said numbers
 * @param diceRolls {Array<number>} array of numbers between 1 and 6
 * @returns {PlayerRoundsData}
 */
export const damageCalc = (diceRolls: Array<number>): PlayerRoundsData => {
  // set up variables
  let totalScore = 0
  let rollIndex = 0
  let roundIndex = 0
  let isWin = false

  // temp storage for round roills
  let roundRolls: Array<RollData> = []
  // set up retrun value
  const roundsData: PlayerRoundsData = {
    rounds: [],
    gameWinRollIndex: 0,
    gameWinRoundIndex: 0,
  }

  for (let index = 0; index < diceRolls.length; index++) {
    const roll = diceRolls[index]
    // grab damage value
    const damage = diceValues[roll]
    // iterate total score
    totalScore += damage

    // reset total score to 15 if over 21
    if (totalScore > 21 && roundsData.gameWinRoundIndex === 0) {
      totalScore = 15
    }

    // set game index if win
    if (totalScore === 21) {
      roundsData.gameWinRoundIndex = roundIndex
      roundsData.gameWinRollIndex = rollIndex
      isWin = true
    }

    // push new roll to round rolls
    roundRolls.push({ damage, roll, totalScore })

    // if we're starting a new round, push the round to roundsData
    // clear roundRolls, increment roundIndex, reset rollIndex
    // push last rolls in if it's a winning roll
    if (rollIndex === 2 || isWin) {
      const roundData = {
        roundNumber: roundIndex + 1,
        totalDamageSoFar: totalScore,
        rolls: roundRolls,
      }

      roundsData.rounds.push(roundData)
      roundRolls = []
      roundIndex++
      rollIndex = 0
    } else {
      rollIndex++
    }
    // stop loop if win, else increment rollIndex
    if (isWin) {
      break
    }
  }
  return roundsData
}

/**
 * Creates an array of rolls that add up to 21
 * @returns ArrayMnumbeR>
 */
export const completeGameForPlayer = (): PlayerRoundsData => {
  const rolls = diceRolls(100)
  return damageCalc(rolls)
}
