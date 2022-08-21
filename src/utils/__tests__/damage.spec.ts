import { rollDice } from '../damage'

describe('RNG test suite', () => {
  it('produces correct numbers', () => {
    for (let i = 1; i < 10; i++) {
      const { diceValue, number } = rollDice()
      expect(diceValue <= 6).toBeTruthy()
      expect(number === 1 || number === 2 || number === 3).toBeTruthy()
    }
  })
})

// describe('Damage engine'). () =>
