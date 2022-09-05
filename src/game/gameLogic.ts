import Game from '../models/game'

import Player from '../models/player'

export const diceRolls = (): Array<number> => {
  let randomRolls = [...Array(100)].map((_) => ~~(Math.random() * 6) + 1)
  return randomRolls
}

export const damageCalc = (diceRolls: Array<number>): Array<number> => {
  const diceValues: { [key: number]: number } = {
    1: 1,
    2: 1,
    3: 2,
    4: 2,
    5: 3,
    6: 3,
  }
  let totalScore = 0
  let damage = diceRolls.map((diceRandValue) => diceValues[diceRandValue])
  let gameWinIndex = 0

  damage.map((theDmg, index) => {
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
function findZen(players: Array<Player>) {
  const uniqueElements = new Set(players)
  const filteredElements = players.filter((item) => {
    if (uniqueElements.has(item)) {
      uniqueElements.delete(item)
    } else {
      return item
    }
  })

  return [...new Set(uniqueElements)]
}
// export default async function runGame(game: Game, test: boolean) {
//   try {
//     const playerArr = Object.values(game.players)
//     // game.maxRolls = Math.max(...playerArr.map(o => o.rolls.length))
//     game.maxRoundNumber = Math.floor(Math.max(game.maxRolls / 3))
//     game.zen = true
//     console.table(findZen(playerArr))
//   } catch (error) {
//     console.log(error)
//   }
// }
