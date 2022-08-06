import { rollDice } from '../damage'

describe('RNG test suite', () => {
  it('produces correct numbers', () => {
    for (let i = 1; i < 10; i++) {
      const num = rollDice()
      expect(num === 1 || num === 2 || num === 3).toBeTruthy()
    }
  })
})

// describe('Damage engine'). () => 
