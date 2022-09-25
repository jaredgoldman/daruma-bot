import { ObjectId } from 'mongodb'
import Asset from '../models/asset'
import Player from '../models/player'
import { PlayerRoundsData } from '../types/attack'

const playerRoundsData: PlayerRoundsData[] = [
  {
    rounds: [
      {
        roundNumber: 1,
        totalDamageSoFar: 7,
        rolls: [
          { damage: 2, roll: 3, totalScore: 2 },
          { damage: 2, roll: 4, totalScore: 4 },
          { damage: 3, roll: 5, totalScore: 7 },
        ],
      },
      {
        roundNumber: 2,
        totalDamageSoFar: 15,
        rolls: [
          { damage: 3, roll: 5, totalScore: 10 },
          { damage: 3, roll: 5, totalScore: 13 },
          { damage: 2, roll: 4, totalScore: 15 },
        ],
      },
      {
        roundNumber: 3,
        totalDamageSoFar: 18,
        rolls: [
          { damage: 1, roll: 2, totalScore: 16 },
          { damage: 1, roll: 2, totalScore: 17 },
          { damage: 1, roll: 2, totalScore: 18 },
        ],
      },
      {
        roundNumber: 4,
        totalDamageSoFar: 21,
        rolls: [{ damage: 3, roll: 5, totalScore: 21 }],
      },
    ],
    gameWinRollIndex: 0,
    gameWinRoundIndex: 3,
  },
  {
    rounds: [
      {
        roundNumber: 1,
        totalDamageSoFar: 3,
        rolls: [
          { damage: 1, roll: 2, totalScore: 1 },
          { damage: 1, roll: 1, totalScore: 2 },
          { damage: 1, roll: 2, totalScore: 3 },
        ],
      },
      {
        roundNumber: 2,
        totalDamageSoFar: 12,
        rolls: [
          { damage: 3, roll: 5, totalScore: 6 },
          { damage: 3, roll: 5, totalScore: 9 },
          { damage: 3, roll: 5, totalScore: 12 },
        ],
      },
      {
        roundNumber: 3,
        totalDamageSoFar: 17,
        rolls: [
          { damage: 2, roll: 3, totalScore: 14 },
          { damage: 1, roll: 1, totalScore: 15 },
          { damage: 2, roll: 3, totalScore: 17 },
        ],
      },
      {
        roundNumber: 4,
        totalDamageSoFar: 15,
        rolls: [
          { damage: 2, roll: 4, totalScore: 19 },
          { damage: 1, roll: 2, totalScore: 20 },
          { damage: 3, roll: 5, totalScore: 15 },
        ],
      },
      {
        roundNumber: 5,
        totalDamageSoFar: 21,
        rolls: [
          { damage: 3, roll: 5, totalScore: 18 },
          { damage: 1, roll: 2, totalScore: 19 },
          { damage: 2, roll: 3, totalScore: 21 },
        ],
      },
    ],
    gameWinRollIndex: 2,
    gameWinRoundIndex: 4,
  },

  {
    rounds: [
      {
        roundNumber: 1,
        totalDamageSoFar: 5,
        rolls: [
          { damage: 1, roll: 1, totalScore: 1 },
          { damage: 3, roll: 5, totalScore: 4 },
          { damage: 1, roll: 1, totalScore: 5 },
        ],
      },
      {
        roundNumber: 2,
        totalDamageSoFar: 12,
        rolls: [
          { damage: 2, roll: 3, totalScore: 7 },
          { damage: 2, roll: 4, totalScore: 9 },
          { damage: 3, roll: 5, totalScore: 12 },
        ],
      },
      {
        roundNumber: 3,
        totalDamageSoFar: 15,
        rolls: [
          { damage: 1, roll: 2, totalScore: 13 },
          { damage: 1, roll: 1, totalScore: 14 },
          { damage: 1, roll: 1, totalScore: 15 },
        ],
      },
      {
        roundNumber: 4,
        totalDamageSoFar: 19,
        rolls: [
          { damage: 1, roll: 2, totalScore: 16 },
          { damage: 2, roll: 3, totalScore: 18 },
          { damage: 1, roll: 2, totalScore: 19 },
        ],
      },
      {
        roundNumber: 5,
        totalDamageSoFar: 21,
        rolls: [{ damage: 2, roll: 4, totalScore: 21 }],
      },
    ],
    gameWinRollIndex: 0,
    gameWinRoundIndex: 4,
  },
]

// map player data
const mockPlayers = playerRoundsData.map(
  (playerRounds: PlayerRoundsData, index: number) => {
    const playerNMumber = index + 1
    const mockPlayer = new Player(
      `player-${playerNMumber}`,
      '#',
      '#',
      new Asset('#', 0, `test-player-asset ${playerNMumber}`, '#'),
      new ObjectId()
    )
    mockPlayer.setRoundsData(playerRounds)
    return mockPlayer
  }
)

export default mockPlayers
