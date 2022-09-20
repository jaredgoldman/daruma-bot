import { ObjectId } from 'mongodb'
import Asset from '../../models/asset'
import Player from '../../models/player'
import {
  createRoundCell,
  createRoundNumberRow,
  createAttackCell,
  createAttackRow,
  // createAttackRows,
} from '../board'

describe('first row board test suite', () => {
  it('correct labels are created from createRoundCell', () => {
    expect(createRoundCell(1)).toEqual(`     01    `)
    expect(createRoundCell()).toEqual(`           `)
  })

  it('correctly maps out both round numbers', () => {
    expect(createRoundNumberRow(1, 2, true)).toEqual(`     01               `)
    expect(createRoundNumberRow(2, 2)).toEqual(`     01         02    `)
    expect(createRoundNumberRow(6, 2)).toEqual(`     05         06    `)
  })
})

describe('attack row test suite', () => {
  it('correctly creats an attack cell', () => {
    expect(createAttackCell()).toEqual('     ')
    expect(createAttackCell(5)).toEqual('5    ')
    expect(createAttackCell(10)).toEqual('10   ')
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

    const expectedResult = `3    3    3    3    3    3    `
    expect(createAttackRow(rolls)).toEqual(expectedResult)
  })

  it('correctly maps out attacks row for less than six attacks', () => {
    const rolls = [
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
      { damage: 3, roll: 0 },
    ]

    const expectedResult = `3    3    3                   `
    expect(createAttackRow(rolls)).toEqual(expectedResult)
  })

  it('makes multiple attack rows', () => {
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

    player1.setRolls(rolls)
    player2.setRolls(rolls)
    const players = [player1, player2]
    // expect(createAttackRows(players, 1, 8)).toEqual('')
  })
})
