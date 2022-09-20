import { ObjectId } from 'mongodb'
import Asset from '../../models/asset'
import Player from '../../models/player'
import {
  createRoundCell,
  createRoundNumberRow,
  createAttackCell,
  createAttackRow,
  createAttackAndTotalRows,
  findRoundTotal,
  renderBoard,
  // createAttackRows,
} from '../board'
import { boardConfig } from '../../config/board'
import { createCell } from '../../utils/board'

const { roundWidth, cellWidth } = boardConfig.board

/**
 * WORK IN PROGRESS
 * tests are not complete
 */

// Tests variables
const rolls = [
  { damage: 1, roll: 0 },
  { damage: 2, roll: 0 },
  { damage: 3, roll: 0 },
  { damage: 4, roll: 0 },
  { damage: 5, roll: 0 },
  { damage: 6, roll: 0 },
  { damage: 7, roll: 0 },
  { damage: 8, roll: 0 },
  { damage: 9, roll: 0 },
  { damage: 10, roll: 0 },
]

const player1 = new Player(
  'test-user-1',
  '00000',
  '00000',
  new Asset('0000', 1, '', ''),
  new ObjectId()
)

const player2 = new Player(
  'test-user-2',
  '00000',
  '00000',
  new Asset('0000', 1, '', ''),
  new ObjectId()
)

const players = [player1, player2]

describe('first row board test suite', () => {
  it('correct labels are created from createRoundCell', () => {
    expect(createRoundCell().length === roundWidth).toBeTruthy()
  })

  it('correctly maps out both round numbers', () => {
    const numOfCells = 2
    expect(
      createRoundNumberRow(1, numOfCells, true).includes('01')
    ).toBeTruthy()
    expect(
      createRoundNumberRow(1, numOfCells, true).length ===
        numOfCells * roundWidth
    ).toBeTruthy()
  })
})

describe('attack row test suite', () => {
  it('correctly creats an attack cell', () => {
    expect(createAttackCell().length === cellWidth).toBeTruthy()
  })

  it('correctly maps out attack row for user with 6 attacks', () => {
    const rolls = [
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
    ]

    const expectedResult = `3   3   3   3   3   3   `
    expect(createAttackRow(rolls)).toEqual(expectedResult)
  })

  it('correctly maps out attacks row for less than six attacks', () => {
    const rolls = [
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
    ]

    const expectedResult = `3   3   3               `
    expect(createAttackRow(rolls)).toEqual(expectedResult)
  })

  it('makes multiple attack rows', () => {
    player1.setRolls(rolls)
    player2.setRolls(rolls)

    const expectedResult = ``

    // console.log(createAttackAndTotalRows(players, players.length - 1, 2, 1))
    // two players, on second player turn, on third roll, 1st round
    // expect(createAttackAndTotalRows(players, players.length - 1, 2, 1)).toEqual(
    //   expectedResult
    // )
    expect(findRoundTotal(rolls)).toEqual(55)
  })
})

describe('Test suite for rendering entire board', () => {
  it('renders an entire bboard', () => {
    console.log(renderBoard(9, 3, 0, players))
  })
})
